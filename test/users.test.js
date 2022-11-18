require('dotenv').config({path: './.env'})

const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../api');
const should = chai.should()
chai.use(chaiHttp);

before((done) => {
    mongoose.connect(process.env.MONGO_TEST_URI);

    mongoose.connection.once('open', ()=>{
        console.log('Database connected');
        done();
    }).on('error', (error) => {
        console.log('Error in connecting DB: ', error);
    })
})

let userToken = "", userId = ""

describe('USERS', () => {
    describe('/POST add user', () => {
        it('User data missing', (done) => {
            const userData = {
                "email": "",
                "password": "qwertyuiop"
            }
    
            chai.request(server)
                .post('/api/adduser')
                .send(userData)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property("message").eql(`"${!userData.email ? "email" : "password"}" is not allowed to be empty`);
                    done();
                })
        })
        it('Creating user', (done) => {
            const userData = {
                "email": "virat3@gmail.com",
                "password": "qwertyuiop"
            }
    
            chai.request(server)
                .post('/api/adduser')
                .send(userData)
                .end((err, res) => {
                    userToken = res.body.token;
                    userId = res.body.userId;
                    res.should.have.status(200);
                    res.body.should.have.property("token");
                    done();
                })
        })
        it('User exist with this credential', (done) => {
            const userData = {
                "email": "virat3@gmail.com",
                "password": "qwertyuiop"
            }
    
            chai.request(server)
                .post('/api/adduser')
                .send(userData)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.body.should.have.property("message").eql("User with this email already exists");
                    done();
                })
        })
    })

    describe('/POST authenticate', () => {
        it('Incorrect credentials', (done) => {
            const userData = {
                "email" :"virat3@gmail.com",
                "password": "qwertyuio"
            }
            chai.request(server)
                .post('/api/authenticate')
                .send(userData)
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.have.property("message").eql("Please check the email and password");
                    done();
                })
        })
        it('Authenticate successful', (done) => {
            const userData = {
                "email" :"virat3@gmail.com",
                "password": "qwertyuiop"
            }
            chai.request(server)
                .post('/api/authenticate')
                .send(userData)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.have.property("token");
                    done();
                })
        })
    })

    describe('/FOLLOW user', () => {
        it('User does not exist', (done) => {
            chai.request(server)
                .post('/api/follow/637625ad1383ccab08d3785d')
                .set('Authorization', userToken)
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.have.property("message").eql("User with this ID does not exist")
                    done();
                })
        })
        it('Can not follow yourself', (done) => {
            chai.request(server)
            .post(`/api/follow/${userId}`)
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(400)
                res.body.should.have.property("message").eql("Cannot follow yourself")
                done()
            })
        })
        it('Follow successfully', (done) => {
            chai.request(server)
            .post(`/api/follow/63762978a5bfa5f74b936864`)
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.have.property("message").eql("You started following 63762978a5bfa5f74b936864")
                done()
            })
        })
        it('Already follow this user', (done) => {
            chai.request(server)
            .post(`/api/follow/63762978a5bfa5f74b936864`)
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(400)
                res.body.should.have.property("message").eql("You already follow this user.")
                done()
            })
        })
    })

    describe('/UNFOLLOW user', () => {
        it('User does not exist', (done) => {
            chai.request(server)
            .post('/api/unfollow/637625ad1383ccab08d3785d')
            .set('Authorization', `${userToken}`)
            .end((err, res) => {
                res.should.have.status(400)
                res.body.should.have.property("message").eql("User with this ID does not exist")
                done();
            })
        })
        it('Can not unfollow yourself', (done) => {
            chai.request(server)
            .post(`/api/unfollow/${userId}`)
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(400)
                res.body.should.have.property("message").eql("Invalid operation")
                done()
            })
        })
        it('Unfollowed successfully', (done) => {
            chai.request(server)
            .post(`/api/unfollow/63762978a5bfa5f74b936864`)
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.have.property("message").eql("You unfollowed 63762978a5bfa5f74b936864")
                done()
            })
        })
        it('Not following this user', (done) => {
            chai.request(server)
            .post(`/api/unfollow/63762978a5bfa5f74b936864`)
            .set('Authorization', userToken)
            .end((err, res) => {
                res.should.have.status(400)
                res.body.should.have.property("message").eql("You don't follow this user.")
                done()
            })
        })
    })

    describe('/DELETE user', () => {
        it('Delete user', (done) => {
            chai.request(server)
                .delete('/api/user')
                .set('Authorization', `${userToken}`)
                .end((err, res) => {
                    if(err){
                        console.log(err);
                    }
                    res.should.have.status(200);
                    res.body.should.have.property("message");
                    done();
                })
        })
    })
 })