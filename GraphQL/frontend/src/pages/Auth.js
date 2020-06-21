import React, { Component } from 'react';
import './Auth.css';
import AuthContext from '../context/authContext';

export default class Auth extends Component 
{
    state = 
    {
        isLogin: true,
        justAfterSignUp: false
    };

    constructor(props)
    {
        super(props);

        this.emailEl = React.createRef();
        this.passwordEl = React.createRef();
    }

    static contextType = AuthContext;

    switchModeHandler = () =>
    {
        this.setState(prevState =>
        {
            return {
                isLogin: !prevState.isLogin
            }
        })
    }
    
    submitHandler = async event =>
    {
        event.preventDefault();

        const email = this.emailEl.current.value;
        const password = this.passwordEl.current.value;

        if( !email.trim().length || !password.trim().length )
        return;

        let requestBody = 
        {
            query: `
                query
                {
                    login(email: "${email}", password: "${password}")
                    {
                        userId
                        token
                        tokenExpiration
                    }
                }
            `
        }

        if( !this.state.isLogin )
        {   
            requestBody =
            {
                query: `
                    mutation CreateUser($email: String!, $password: String!)
                    {
                        createUser(userInput: { email: $email, password: $password })
                        {
                            _id
                            email
                            createdEvents
                            {
                                title
                            }
                        }
                    }
                `,
                variables:
                {
                    email,
                    password
                }
            };
        }
        
        try
        {
            const result = await fetch("http://localhost:8000/graphql",
            {
                method: "POST",
                body: JSON.stringify(requestBody),
                headers:
                {
                    'Content-Type': "application/json"
                }

            });
            
            if( result.status !== 200 && result.status !== 201 )
            throw new Error("Failed!");

            // json() is the method we call on response object given by fetch() api which will automatically extract and parse the 
            // response body.
            const resData =  await result.json();
            
            if( !resData )
            throw new Error("Failed baby");

            if( resData.data.login )
            {
                this.context.login(
                    resData.data.login.token,
                    resData.data.login.userId,
                    resData.data.login.tokenExpiration,
                );
            }

            else
            {
                this.setState({ justAfterSignUp: true });
                
                setTimeout(() => 
                {
                    this.setState({ justAfterSignUp: false });

                },5000);
            }

            console.log("Auth.js : ",resData.data);
        }
        
        catch(error)
        {
            throw error;
        }  
    }

    render() 
    {
        return (
            <React.Fragment>

                { 
                    this.state.justAfterSignUp && (
                        <div className="justAfterSignUp">
                            Your are successfully Registered. Now login to continue !!
                        </div>
                    )
                }

                <form className="auth-form" onSubmit = { this.submitHandler }> 

                    <div className="form-control">
                        <label htmlFor="email">E-Mail</label>
                        <input type="email" id="email" ref = { this.emailEl }/>
                    </div>

                    <div className="form-control">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" ref = { this.passwordEl }/>
                    </div>

                    <div className="form-actions">
                        <button type="submit">Submit</button>
                        <button 
                            type="button" 
                            onClick = { this.switchModeHandler }>
                            { this.state.isLogin ? "Switch to Signup" : "Switch to Login" }
                        </button>
                    </div>
                        
                </form>

            </React.Fragment>
        );
    }
}