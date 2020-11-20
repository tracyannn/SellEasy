import React, { useState, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import Cookies from 'universal-cookie';

function Account() {

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [loggedIn, setLoggedIn] = useState(false);

    const cookies = new Cookies();

    let history = useHistory();

    const logout = (e) => {
        e.preventDefault();

        axios.post('http://localhost:5000/api/logout', {}, {
            headers: {
                'Authorization': `Bearer ${cookies.get("token")}`
            }
        }).then(response => {
            if(response.status === 200) {
                cookies.remove('email');
                cookies.remove('token');

                history.push("/");
            }
        }).catch(error => {
            console.log("This person is not logged in")
        }) 
    }

    useEffect(() => {

        let email = cookies.get('email');
        let token = cookies.get('token');

        if(email && token) {
            axios.get(`http://localhost:5000/api/authenticated`, {
                params: {
                    email: email,
                    token: token
                }
            })
            .then((response) => {

                if(response.status === 200) {
                    cookies.set('email', response.data.email, {path: '/'});
                    cookies.set('token', response.data.token, {path: '/'});

                    setLoggedIn(true);

                    axios.get(`http://localhost:5000/api/post/user`, {
                        params: {
                            email: cookies.get('email')
                        }
                    }).then((response) => {
                        setData(response.data.data);
                        setLoading(false);
                    }).catch((error) => {
                        setData([]);
                        setLoading(false);
                    })

                } 

                
            })
            .catch((error) => {
                cookies.remove('email');
                cookies.remove('token');
                setLoading(false);
            });
        } else {
            setLoading(false);
        }

    }, [])

    return (
        <Container>

            {
                loading ? "" :
                loggedIn ?
                (typeof data === 'undefined' || data.length === 0) ? 
                <Row>
                    <Col sm={3} style={{backgroundColor: "rgb(247,247,249)"}}>
                        <Row className="mt-3 ml-1">
                            <p style={{fontWeight: "bold", }}>Email</p>
                            <p style={{marginLeft: "5px"}}>{cookies.get('email')}</p>
                        </Row>
                        <Row className="ml-1">
                            <p style={{fontWeight: "bold", }}>Zip Code:</p>
                            <p style={{marginLeft: "5px"}}>{cookies.get('zipcode')}</p>
                        </Row>
                        <Row className="ml-1">
                            <Button variant="danger" onClick={logout}>
                                Logout
                            </Button>
                        </Row>
                    </Col>
                </Row>
                : 

                <Row>
                    <Col sm={3} style={{backgroundColor: "rgb(247,247,249)"}}>
                        <Row className="mt-3 ml-1">
                            <p style={{fontWeight: "bold", }}>Email</p>
                            <p style={{marginLeft: "5px"}}>{data[0].email}</p>
                        </Row>
                        <Row className="ml-1">
                            <p style={{fontWeight: "bold", }}>Zip Code:</p>
                            <p style={{marginLeft: "5px"}}>{data[0].zip}</p>
                        </Row>
                        <Row className="ml-1">
                            <Button variant="danger" onClick={logout}>
                                Logout
                            </Button>
                        </Row>
                    </Col>
                    <Col sm={9} style={{border: "1px solid black"}}>
                        {
                            data.map(item => (
                                <Row key={Math.random()} className="m-1">
                                    <div style={{backgroundColor: "gray", width: "100%"}}>
                                        <p>{item.title}</p>
                                        <p>{item.description}</p>
                                        <p>{item.createdAt}</p>
                                    </div>
                                </Row>
                            ))
                        }
                    </Col>
                </Row>

                :

                <Row className="justify-content-md-center mt-5">

                    <Button className="mr-2" onClick={() => {history.push('/signin')}}>Sign In</Button>
                    <Button className="ml-2" onClick={() => {history.push('/signup')}}>Sign Up</Button>
                   
                </Row>

            }

        </Container>
    )
}

export default Account;