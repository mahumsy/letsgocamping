import React, {useState} from "react";
import { useNavigate } from "react-router-dom";


function Home() {

    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate("/login");
    };


    return (
        <div className="body">
            <div className="btns">
                <button className="login-button" onClick={handleLoginClick}>Login</button>

                <button className="create-acct">Create Account</button>
            </div>
            <div className="landscape-image">
                <img src="https://cdn.glitch.me/b29dd3df-e938-4d03-84fc-259d988ad64d/landscape.png?v=1709606071707"
                     alt="Landscape"
                     className="landscape-imagee"/>
                <div className="center">
                    Explore the National Parks of the U.S.
                </div>

            </div>




            <div className="box">
                <div className="list">
                    <ul>


                        <li>Search for a Park</li>
                        <li>Create a list of your Favorites</li>
                        <li>Compare your Favorites with your Friends & Make Suggestions</li>
                        {/*<li>Suggest Parks to Each Other </li>*/}
                    </ul>

                </div>
            </div>



        </div>

    );
}

export default Home;