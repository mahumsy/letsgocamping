package edu.usc.csci310.project;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.*;

import java.util.List;


@Service
public class UserService {
    private UserRepository userRepository;
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public void setMyRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Autowired
    public void setPasswordEncoder(BCryptPasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    public ResponseEntity<?> registerUser(String username, String password, String confirmPassword) {
        if (userRepository.findByUsername(username) == null) {
            if(password.isEmpty()) return ResponseEntity.badRequest().body("Password field cannot be empty");
            int checker= isValidPassword(password);
            if (checker!=4) {
                if(checker == 1) return ResponseEntity.badRequest().body("Password must have one uppercase character");
                if(checker == 2) return ResponseEntity.badRequest().body("Password must have one lowercase character");
                return ResponseEntity.badRequest().body("Password must have one numerical character");
            }
            if(!confirmPassword.equals(password)) return ResponseEntity.badRequest().body("Password and confirm password must match");
            String hashedPassword = passwordEncoder.encode(password);
            User newUser = new User();
            newUser.setTime1(0L);
            newUser.setTime2(0L);
            newUser.setLockoutTime(0L);
            newUser.setUsername(username);
            newUser.setPassword(hashedPassword);
            return ResponseEntity.ok(userRepository.save(newUser));
        } else {
            return ResponseEntity.badRequest().body("Username exists");
        }
    }

    public ResponseEntity<?> loginUser(String username, String password) {
        if(userRepository.findByUsername(username) != null) {
            User user = userRepository.findByUsername(username);
            if((System.currentTimeMillis()-user.getLockoutTime())<30000)
            {
                user.setTime1(0L);
                user.setTime2(0L);
                user.setLockoutTime(System.currentTimeMillis());
                userRepository.save(user);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Wait 30 seconds!");

            }
            else {
                user.setLockoutTime(0L);
                if (passwordEncoder.matches(password, user.getPassword())) {
                    user.setTime1(0L);
                    user.setTime2(0L);
                    userRepository.save(user);
                    return ResponseEntity.ok(user);
                } else {
                    if (user.getTime1() == 0L) {
                        user.setTime1(System.currentTimeMillis());
                        userRepository.save(user);
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Incorrect password");
                    } else if (user.getTime2() == 0L) {
                        user.setTime2(System.currentTimeMillis());
                        userRepository.save(user);
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("One more fail may lockout");
                    } else {
                        if ((System.currentTimeMillis() - user.getTime1()) < 60000) {
                            user.setLockoutTime(System.currentTimeMillis());
                            user.setTime1(0L);
                            user.setTime2(0L);
                            userRepository.save(user);
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("You are locked out for 30 seconds");
                        } else {
                            user.setTime1(user.getTime2());
                            user.setTime2(System.currentTimeMillis());
                            userRepository.save(user);
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("One more fail may lockout");
                        }
                    }
                }
            }
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username does not exist");
        }
    }

    public ResponseEntity<?> removeUser(String username) {
        if(userRepository.findByUsername(username) != null){
            userRepository.delete(userRepository.findByUsername(username));
            Groups.removeUserEntry(username);
            return ResponseEntity.ok("User Deleted");
        }
        else{
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username does not exist");
        }
    }

    private int isValidPassword(String password) {
        boolean hasUppercase = !password.equals(password.toLowerCase());
        boolean hasLowercase = !password.equals(password.toUpperCase());
        boolean hasNumber  = password.matches(".*[0-9].*");

        if(!hasUppercase)return 1;
        else if(!hasLowercase) return 2;
        else if(!hasNumber) return 3;
        else return 4;
    }

    public ResponseEntity<?> addUserToGroup(String username, String usernameQuery) {
        User user = userRepository.findByUsername(username);
        User userB = userRepository.findByUsername(usernameQuery);
        if(user != null && userB != null) { // Both usernames exists within database
            if(Objects.equals(username, usernameQuery)){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Cannot add yourself to your own friend group");
            }
            if(Groups.getGroupOfFriends(username).contains(usernameQuery)){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username is already in your friend group");
            }
//            if(userB.isFavPrivate() == true){ // userB has private list
//                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User cannot be added due to them having a private favorite park list");
//            }
            Groups.addToGroupOfFriends(username, usernameQuery);
            // userRepository.save(user); // Update the database

            return ResponseEntity.ok(Groups.getGroupOfFriends(username));
        }
        else { // Username does not exists within database
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username does not exist");
        }
    }

    public ResponseEntity<?> compareParks(String username) {
        User user = userRepository.findByUsername(username);
        if(user != null){
            // Get string usernames of friends in group
            List<String> userGroup = Groups.getGroupOfFriends(username);
            if(userGroup.isEmpty()){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("You have no friends in your group to compare parks with");
            }

            // Retrieve ALL favorite parks of each username, including myself
            HashMap<String, Integer> parkCounts = new HashMap<>();
            HashMap<String, List<String>> parksToUsers = new HashMap<>(); // Map park ID to associated usernames
            List<String> favs = user.getFavorites();
            for(String parkID : favs) { // each parkID in userI favorites list
                int count = parkCounts.getOrDefault(parkID, 0);
                parkCounts.put(parkID, count + 1);
//                if(!parksToUsers.containsKey(parkID)){ // IMPOSSIBLE to fail since I'm starting with fresh parksToUsers
                    parksToUsers.put(parkID, new ArrayList<>());
//                }
                parksToUsers.get(parkID).add(user.getUsername());
            }
            for(String userI : userGroup){ // Now retrieve for the entire group
                // do something with userI
                favs = userRepository.findByUsername(userI).getFavorites();
                for(String parkID : favs) { // each parkID in userI favorites list
                    int count = parkCounts.getOrDefault(parkID, 0);
                    parkCounts.put(parkID, count + 1);
                    if(!parksToUsers.containsKey(parkID)){
                        parksToUsers.put(parkID, new ArrayList<>());
                    }
                    parksToUsers.get(parkID).add(userI);
                }
            }


            // Sort the HashMap based on their count values
            List<Map.Entry<String, Integer>> sortedIDs = new ArrayList<>(parkCounts.entrySet());
            sortedIDs.sort(new Comparator<Map.Entry<String, Integer>>() {
                @Override
                public int compare(Map.Entry<String, Integer> entry1, Map.Entry<String, Integer> entry2) {
                    return entry2.getValue().compareTo(entry1.getValue()); // Sort in descending order of count values
                }
            });

            CompareResponse cr = new CompareResponse();
            cr.setSortedIDs(sortedIDs);
            cr.setParksToUsers(parksToUsers);
            cr.setGroupSize(userGroup.size());
            cr.setGroupMembers(userGroup);
            return ResponseEntity.ok(cr);
        }
        else { // Username does not exists within database
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username does not exist");
        }
    }


    public ResponseEntity<?> getFavorites(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        List<String> favorites = user.getFavorites();
        return ResponseEntity.ok(new FavoritesResponse(favorites));
    }

    public ResponseEntity<?> addFavorite(String username, String parkId) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        List<String> favorites = user.getFavorites();
        if (favorites == null) {
            favorites = new ArrayList<>();
            user.setFavorites(favorites);
        }

        if (!favorites.contains(parkId)) {
            favorites.add(parkId);
            userRepository.save(user);
            return ResponseEntity.ok(new FavoritesResponse(favorites));
        } else {
            return ResponseEntity.badRequest().body("Park already in favorites");
        }
    }

    public ResponseEntity<?> removeFavorite(String username, String parkId) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        List<String> favorites = user.getFavorites();
        if (favorites == null || !favorites.contains(parkId)) {
            return ResponseEntity.badRequest().body("Park not in favorites");
        }

        favorites.remove(parkId);
        userRepository.save(user);
        return ResponseEntity.ok("Park removed from favorites");
    }

    public ResponseEntity<?> clearFavorites(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            return ResponseEntity.badRequest().body("User not found");
        }

        user.setFavorites(new ArrayList<>());
        userRepository.save(user);
        return ResponseEntity.ok("All favorites cleared");
    }


}






