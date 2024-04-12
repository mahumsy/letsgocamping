import React, { useEffect, useState } from 'react';
import Header from "../components/Header";
import Footer from "../components/Footer";

const Favorites = () => {
    const [userFavorites, setUserFavorites] = useState([]);
    const [favoriteParks, setFavoriteParks] = useState([]);
    const [selectedPark, setSelectedPark] = useState(null);
    const [parkAmenities, setParkAmenities] = useState([]);
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
    const [hoveredPark, setHoveredPark] = useState(null);
    const [showSingleDeleteConfirmation, setShowSingleDeleteConfirmation] = useState(false);
    const [parkToDelete, setParkToDelete] = useState(null);

    const API_KEY = process.env.REACT_APP_API_KEY;
    const BASE_URL = "https://developer.nps.gov/api/v1/parks";

    useEffect(() => {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
        if(userInfo) {
            const username = userInfo.username;
            fetchUserFavorites(username)
                .then((favorites) => {
                    setUserFavorites(favorites);
                    Promise.all(favorites.map(async (parkCode) => {
                        const park = await fetchParkDetails(parkCode);
                        return park?.fullName;
                    }))
                        .then(setFavoriteParks)
                        .catch((error) => {
                            console.error('Error fetching favorite park names:', error);
                        });
                })
                .catch((error) => {
                    console.error('Error fetching user favorites:', error);
                });
        } else {
            console.error('User info not found in session storage');
        }
    }, []);

    const fetchUserFavorites = async (username) => {
        try {
            const response = await fetch(`/favorites?username=${username}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user favorites');
            }
            const data = await response.json();
            return data.favorites;
        } catch (error) {
            console.error('Error fetching user favorites:', error);
            return [];
        }
    };


    const handleConfirmClearFavorites = async () => {
        try {
            const username = JSON.parse(sessionStorage.getItem('userInfo')).username;
            const response = await fetch(`/favorites/clear?username=${username}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to clear favorites');
            }

            setUserFavorites([]);
            setFavoriteParks([]);
            setShowConfirmationPopup(false);

        } catch (error) {
            console.error('Error clearing favorites:', error);
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
                console.error("Failed to fetch amenities.");
                return [];
            }
        } catch (error) {
            console.error("Error fetching amenities data.");
            return [];
        }
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

    const handleRemoveFavorite = async (parkCode) => {
        setParkToDelete(parkCode);
        setShowSingleDeleteConfirmation(true);
    };

    const handleConfirmSingleDelete = async () => {
        try {
            const username = JSON.parse(sessionStorage.getItem('userInfo')).username;
            const response = await fetch(`/favorites/remove?username=${username}&parkId=${parkToDelete}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to remove park from favorites');
            }

            setUserFavorites((prevFavorites) => prevFavorites.filter((code) => code !== parkToDelete));
            setFavoriteParks((prevFavorites) => prevFavorites.filter((_, index) => userFavorites[index] !== parkToDelete));
            setShowSingleDeleteConfirmation(false);
        } catch (error) {
            console.error('Error removing park from favorites:', error);
        }
    };

    return (
        <>
            <style>{`
                    .detailsBox {
                        border: 1px solid #ccc;
                        padding: 16px;
                        margin-top: 16px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        background-color: #fff;
                    }
                    
                    .clickable-text {
                        color: #0645AD; 
                        cursor: pointer;
                        text-decoration: underline;
                        margin-right: 5px; 
                    }
                    
                   .remove-from-favorites {
                      font-size: 24px;
                      font-weight: bold;
                      margin-left: 10px;
                      cursor: pointer;
                      color: red;
                    }
                    .confirmation-popup {
                      position: fixed;
                      top: 0;
                      left: 0;
                      width: 100%;
                      height: 100%;
                      background-color: rgba(0, 0, 0, 0.5);
                      display: flex;
                      justify-content: center;
                      align-items: center;
                      z-index: 100;
                    }
                    
                    .confirmation-content {
                      background-color: white;
                      padding: 20px;
                      border-radius: 8px;
                      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                      text-align: center;
                    }
                    
                    .confirmation-buttons {
                      margin-top: 16px;
                    }
                    
                    .confirmation-buttons button {
                      margin: 0 8px;
                    }
               
                `}</style>
            <div>
                <Header/>
                <h2>My Favorite Parks</h2>
                <div>
                    <button onClick={() => setShowConfirmationPopup(true)}>Delete All</button>
                </div>
                {showSingleDeleteConfirmation && (
                    <div className="confirmation-popup">
                        <div className="confirmation-content">
                            <h3>Confirm Delete Favorite Park</h3>
                            <p>Are you sure you want to delete this park from your favorites?</p>
                            <div className="confirmation-buttons">
                                <button onClick={handleConfirmSingleDelete}>Confirm</button>
                                <button onClick={() => setShowSingleDeleteConfirmation(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
                {showConfirmationPopup && (
                    <div className="confirmation-popup">
                        <div className="confirmation-content">
                            <h3>Confirm Delete All Favorites</h3>
                            <p>Are you sure you want to delete all your favorite parks?</p>
                            <div className="confirmation-buttons">
                                <button onClick={handleConfirmClearFavorites}>Confirm</button>
                                <button onClick={() => setShowConfirmationPopup(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
                {userFavorites && userFavorites.length > 0 && (
                    <ul>
                        {userFavorites.map((parkCode, index) => (
                            <li key={parkCode}
                                onMouseEnter={() => setHoveredPark(parkCode)}
                                onMouseLeave={() => setHoveredPark(null)}>
                                <button onClick={() => handleParkSelection(parkCode)}>
                                    {favoriteParks[index]}
                                </button>
                                {hoveredPark === parkCode && (
                                    <span className="remove-from-favorites"
                                          onClick={() => handleRemoveFavorite(parkCode)}>
                                        -
                                    </span>
                                )}

                                {selectedPark && selectedPark.parkCode === parkCode && (
                                    <div className="detailsBox">
                                        <h3>{selectedPark.fullName}</h3>
                                        <img src={selectedPark.images[0].url}
                                             alt={`View of ${selectedPark.fullName}`}
                                             style={{width: '100%', maxHeight: '300px', objectFit: 'cover'}}/>
                                        <p>Description: {selectedPark.description}</p>
                                        <div>
                                            <h4>Location:</h4>
                                            {/*<p onClick={() => handleLocationClick(selectedPark.addresses[0].stateCode)}*/}
                                            {/*   className="clickable-text">*/}
                                            {/*    {selectedPark.addresses[0].city}, {selectedPark.addresses[0].stateCode}*/}
                                            {/*</p>*/}
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
                                                    {/*<span className="clickable-text"*/}
                                                    {/*      onClick={() => handleActivitiesClick(activity.name)}>*/}
                                                    {/*    {activity.name}*/}
                                                    {/*</span>*/}
                                                    {index < selectedPark.activities.length - 1 ? ', ' : ''}
                                                </React.Fragment>
                                            ))}
                                        </p>

                                        <h4>Amenities:</h4>
                                        <p>
                                            {parkAmenities.map((amenity, index) => (
                                                <React.Fragment key={amenity.id}>
                                                    {/*<span className="clickable-text"*/}
                                                    {/*      onClick={() => handleAmenitiesClick(amenity.name)}>*/}
                                                    {/*    {amenity.name}*/}
                                                    {/*</span>*/}
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
        </>
    );
}

export default Favorites;