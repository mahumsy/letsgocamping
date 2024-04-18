import Header from "../components/Header";
import Footer from "../components/Footer";
import React, {useState} from "react";
import '../styles/compare.css'

function Compare(/* {initexpanded= null} */){
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [usernameQuery, setUsernameQuery] = useState("");
    const [parks, setParks] = useState([]);
    const [selectedPark, setSelectedPark] = useState(null); // State to track selected park for details
    const [userFavorites, setUserFavorites] = useState([]);
    const [favoriteParks, setFavoriteParks] = useState([]);
    const [parkAmenities, setParkAmenities] = useState([]);
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
    const [hoveredPark, setHoveredPark] = useState(null);
    const [hoveredRatio, setHoveredRatio] = useState(null); // useState(initexpanded);
    const [showSingleDeleteConfirmation, setShowSingleDeleteConfirmation] = useState(false);
    const [parkToDelete, setParkToDelete] = useState(null);
    const [numberInGroup, setNumberInGroup] = useState("");
    const [numberFavorited, setNumberFavorited] = useState(null);
    const [groupMembers, setGroupMembers] = useState(null);
    const [parksToUsers, setParksToUsers] = useState(null);
    const [ratioUsers, setRatioUsers] = useState("");

    const API_KEY = process.env.REACT_APP_API_KEY;
    const BASE_URL = "https://developer.nps.gov/api/v1/parks";

    const handleAddToGroup = async (e) => {
        e.preventDefault();
        try {
            let userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
            const username = userInfo.username; // Username of currently logged in user

            const response = await fetch("/adduser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({username, usernameQuery})
            })
            if(response.ok) {
                const groupMembersTmp = await response.json();
                console.log(groupMembersTmp);
                setGroupMembers(groupMembersTmp);
                setError("");
                setSuccess(`Successfully added ${usernameQuery} to your group of friends`);
            }
            else {
                const errorText = await response.text();
                setSuccess("");
                setError(`Error: ${errorText}`);
            }
        }
        catch(error){
            setError(error.message);
        }
    };

    const handleCompare = async (e) => {

        let fetchedParks = [];
        let userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
        const username = userInfo.username; // Username of currently logged in user
        fetchGroupFavorites(username)
            .then((favorites) => {
                console.log(favorites);
                let parkIDs = [];
                let counts = [];

                // Extract park IDs and counts into separate arrays
                favorites.sortedIDs.forEach((group) => {
                    // Get the park code (group key)
                    const parkCode = Object.keys(group)[0];
                    // Get the count (group value)
                    const count = group[parkCode];
                    // Push park code and count into arrays
                    parkIDs.push(parkCode);
                    counts.push(count);
                });

                console.log("parkIDs: " + parkIDs);
                console.log("counts: " + counts);
                setNumberFavorited(counts);

                console.log("favorites.parksToUsers: ", favorites.parksToUsers);

                setParksToUsers(favorites.parksToUsers);

                setNumberInGroup(favorites.groupSize + 1);

                // console.log("groupMembers: " + groupMembers); // Will be NULL if user leaves page and comes back without
                // adding anyone new. That's OKAY since it's not really used for this part

                setUserFavorites(parkIDs);
                Promise.all(parkIDs.map(async (parkCode) => {
                    const park = await fetchParkDetails(parkCode);
                    // console.log("Favorites: " + parkIDs);
                    // console.log("parkCode: " + parkCode);
                    // console.log(park);
                    // console.log("park?.fullName: " + park?.fullName);
                    return park?.fullName;
                    // return "";
                }))
                    .then(setFavoriteParks);
                    // .catch((error) => {
                    //     console.error('Error fetching group favorite park names:', error);
                    // });
            })
            .catch(() => {
                console.error('Error fetching group favorites:');
            });

        setError("");

        // setParks(fetchedParks);
        // setSelectedPark(null); // Reset selected park details

    };

    const handleParkSelection = async (parkCode) => {
        if (selectedPark && selectedPark.parkCode === parkCode) {
            setSelectedPark(null);
            setParkAmenities([]);
        } else {
            const details = await fetchParkDetails(parkCode);
            setSelectedPark(details);
            const amenities = await fetchAmenitiesOfPark(`${parkCode}`);
            setParkAmenities(amenities);
        }
    };

    const fetchAmenitiesOfPark = async (parkCode) => {
        const url = `https://developer.nps.gov/api/v1/amenities?q=${parkCode}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'X-Api-Key': API_KEY }
            });
            if (response.ok) {
                const data = await response.json();
                return data.data;
            } else {
                // console.log("HI");
                console.error("Failed to fetch amenities.");
                return [];
            }
        } catch (error) {
            console.log("HI2");
            console.error("Error fetching amenities data.");
            return [];
        }
    };

    const handleRatioHover = async (parkCode) => {
        if(hoveredRatio != null){
            setHoveredRatio(null);
            return;
        }

        setHoveredRatio(parkCode);

        console.log("handleRatioHover(): ", parksToUsers);
        console.log("parkCode: " + parkCode);
        console.log("parksToUsers[parkCode]: ", parksToUsers[parkCode]);
        // const parkObject = parksToUsers.find(item => item[parkCode]);
        // console.log(parkObject);
        setRatioUsers(parksToUsers[parkCode]);
        // setRatioUsers(parkObject);
    };

    const handleSuggest = async (e) => {

    };

    const fetchGroupFavorites = async (username) => {
        try {
            const response = await fetch("/compareparks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({username})
            })
            if(response.ok) {
                const parkIDs = await response.json();
                // console.log("Park IDs: " + parkIDs);
                return parkIDs;
            }
            else {
                const errorText = await response.text();
                setSuccess("");
                setError(`Error: ${errorText}`);
            }
        }
        catch(error){
            setError(error.message);
        }
    };

    const fetchParkDetails = async (parkCode) => {
        const response = await fetch(`${BASE_URL}?parkCode=${parkCode}`, {
            method: 'GET',
            headers: { 'X-Api-Key': API_KEY }
        });
        if (!response.ok) {
            console.error("Failed to fetch park details");
            return null;
        }
        const data = await response.json();
        return data.data[0];
    };

    return(
        <div>
            <Header/>
            <h2>Add A Friend to Your Group</h2>
            <form onSubmit={handleAddToGroup}>
                <label htmlFor={"usernameQuery"}>Username: </label>
                <input id="usernameQuery" type="text" value={usernameQuery} title={"Username Box for adding to group"}
                       onChange={(e) => setUsernameQuery(e.target.value)} tabIndex={0} autoFocus/>
                <input type="submit" value="Add To Group" title={"Submit Username"} id={"addUserBtn"} tabIndex={1}/>
            </form>
            {success && <p>{success}</p>}
            {error && <p>{error}</p>}

            <h2>Compare Parks and Give Suggestions</h2>
            <button title={"Submit Compare"} id={"compareBtn"} tabIndex={3} onClick={handleCompare}>Compare</button>
            <button title={"Submit Suggestion"} id={"suggestBtn"} tabIndex={4} onClick={handleSuggest}>Suggest the Best Park</button>
            {userFavorites && userFavorites.length > 0 && (
                <ul>
                    {userFavorites.map((parkCode, index) => (
                        <li key={parkCode}
                            // onMouseEnter={() => setHoveredPark(parkCode)}
                            // onMouseLeave={() => setHoveredPark(null)}
                        >
                            <button title={`detailsButton_${parkCode}`} onClick={() => handleParkSelection(parkCode)}>
                                {favoriteParks[index]}
                            </button>
                            <span data-testid={`p-${index}`} onClick={() => handleRatioHover(parkCode)}>
                                <span>{numberFavorited[index]} / {numberInGroup}</span>
                                {hoveredRatio === parkCode && (
                                    <span className="ratio-popup">
                                        <div className="ratio-content">
                                            {ratioUsers && ratioUsers.map((user, index) => (
                                                <p key={index}>{user}</p>
                                            ))}
                                        </div>
                                    </span>
                                )}
                            </span>

                            {selectedPark && selectedPark.parkCode === parkCode && (
                                <div className="detailsBox">
                                    <h3>{selectedPark.fullName}</h3>
                                    <img src={selectedPark.images[0].url}
                                         alt={`View of ${selectedPark.fullName}`}
                                         style={{width: '100%', maxHeight: '300px', objectFit: 'cover'}}/>
                                    <p>Description: {selectedPark.description}</p>
                                    <div>
                                        <h4>Location:</h4>
                                        <p>
                                            {selectedPark.addresses[0].city}, {selectedPark.addresses[0].stateCode}
                                        </p>
                                    </div>
                                    <a href={selectedPark.url} target="_blank" rel="noopener noreferrer">Visit
                                        Park
                                        Website</a>
                                    <p>Entrance
                                        Fees: {selectedPark.entranceFees.length > 0 ? `$${selectedPark.entranceFees[0].cost}` : 'No fees information available'}</p>

                                    <h4>Activities:</h4>
                                    <p>
                                        {selectedPark.activities.map((activity, index) => (
                                            <React.Fragment key={activity.id}>
                                                    <span>
                                                        {activity.name}
                                                    </span>
                                                {index < selectedPark.activities.length - 1 ? ', ' : ''}
                                            </React.Fragment>
                                        ))}
                                    </p>

                                    <h4>Amenities:</h4>
                                    <p>
                                        {parkAmenities.map((amenity, index) => (
                                            <React.Fragment key={amenity.id}>
                                                    <span>
                                                        {amenity.name}
                                                    </span>
                                                {index < parkAmenities.length - 1 ? ', ' : ''}
                                            </React.Fragment>
                                        ))}
                                    </p>
                                    <div>
                                        <h4>Operating Hours:</h4>
                                        <p>{selectedPark.operatingHours[0].description}</p>
                                    </div>

                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            <Footer/>
        </div>
    );
}

export default Compare;