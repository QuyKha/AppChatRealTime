import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from 'styled-components'
import Logo from '../assets/logo.svg'
import {ToastContainer, toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'
import { loginRoute } from "../utils/APIRoutes";

function Login() {
    const navigate = useNavigate();
    const [values, setValues] = useState({
        phone: "",
        password: "",
    })

    const toastOptions = {
        position: 'bottom-right',
        autoClose: 8000,
        draggable: true,
        pauseOnHover: true,
        theme: "dark"
    };

    useEffect(() => {
        if (localStorage.getItem("chat-app-user")) {
            navigate('/')
        }
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (handleValidation()) {
            const {phone,password} = values;
            const {data} = await axios.post(loginRoute, {
                phone,
                password,
            });
            if (data.status===false) {
                toast.error(data.msg, toastOptions);
            }
            if (data.status===true) {
                localStorage.setItem('chat-app-user', JSON.stringify(data.user))
                navigate("/");
            }
        }
    }   

    const handleValidation = () => {
        const {username, phone, email, password, confirmPassword} = values;
        if (password === "") {
            toast.error('Phone and Password is required', toastOptions);
            return false;
        } else if (username === "") {
            toast.error('Phone and Password is required', toastOptions);
            return false;
        }
        return true;
    }

    const handleOnChange = (e) => {
        setValues({...values, [e.target.name]: e.target.value})
    }

    return ( <>
        <FormContainer>
            <form onSubmit={(event) => handleSubmit(event)}>
                <div className="brand">
                    <img src={Logo} alt="Logo" />
                    <h1>snappy</h1>
                </div>
                <input type="text" placeholder="Phone" name="phone" onChange={(e) => handleOnChange(e)}/>
                <input type="password" placeholder="Password" name="password" onChange={(e) => handleOnChange(e)} />
                <button type="submit">Login In</button>
                <span>Already have an account <Link to="/register">Register</Link></span>
            </form>
        </FormContainer>
        <ToastContainer/>
    </> );
}

const FormContainer = styled.div`
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    background-color: #131324;
    .brand {
        display: flex;
        align-items: center;
        gap: 1rem;
        justify-content: center;
        img {
            height: 5rem;
        }
        h1 {
            color: white;
            text-transform: uppercase
        }
    }
    form {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        background-color: #00000076;
        border-radius: 2rem;
        padding: 3rem 5rem; 
    }
    input {
        background-color: transparent;
        padding: 1rem;
        border: 0.1rem solid #4e0eff;
        border-radius: 0.4rem;
        color: white;
        width: 100%;
        font-size: 1rem;
        &:focus {
            border: 0.1rem solid #997af0;
            outline: none;
        }
    }
    button {
        background-color: #997af0;
        padding: 1rem 2rem;
        color: white;
        cursor: pointer;
        border: none;
        font-weight: bold;
        border-radius: 0.4rem;
        font-size: 1rem;
        text-transform: uppercase;
        transition: 0.5s ease-in-out;
        &:hover {
            background-color: #4e0eff;
        }
    }
    span {
        color: white;
        text-transform: uppercase;
        a {
            text-decoration: none;
            font-weight: bold;
            color: #4e0eff;
        }
    }
`;


export default Login;