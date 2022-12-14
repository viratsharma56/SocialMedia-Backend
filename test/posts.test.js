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
        console.log('Database connected')
        done();
    }).on('error', (error) => {
        console.log('Error in connecting DB: ', error);
    })
})

let postId = "";

describe('Posts', () => {
    describe('/POST new post', () => {
        it('Create a new post', (done) => {
            const newPost = {
                "title": "Title 1",
                "caption": "Caption 1",
            }
            chai.request(server)
                .post('/api/posts')
                .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Mzc2NDIxZjM4MTc1NDFkNmI3YTFkYjQiLCJpYXQiOjE2Njg2OTQ1NTl9.B4FkD2-qDQAErCkmf1uBaX7XeAxb75MsUB-u7-sD0Zg')
                .send(newPost)
                .end((err, res) => {
                    postId = res.body.postData.postID
                    res.should.have.status(201)
                    res.body.should.have.property('postData')
                    done();
                })
        })
        it('Not create a new post without title', (done) => {
            const newPost = {
                "title": "",
                "caption": "Caption 1",
            }
            chai.request(server)
                .post('/api/posts')
                .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Mzc2NDIxZjM4MTc1NDFkNmI3YTFkYjQiLCJpYXQiOjE2Njg2OTQ1NTl9.B4FkD2-qDQAErCkmf1uBaX7XeAxb75MsUB-u7-sD0Zg')
                .send(newPost)
                .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.have.property('message')
                    done();
                })
        })
    })
    describe('/Delete existing post', () => {
        it('It should not delete a non-existent post', (done) => {
            chai.request(server)
                .delete(`/api/posts/63773975fb3ff469b773aa9e`)
                .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Mzc2NDIxZjM4MTc1NDFkNmI3YTFkYjQiLCJpYXQiOjE2Njg2OTQ1NTl9.B4FkD2-qDQAErCkmf1uBaX7XeAxb75MsUB-u7-sD0Zg')
                .end((err, res) => {
                    res.should.have.status(404)
                    res.body.should.have.property('message').eql('No post found with this ID.')
                    done()
                })
        })
        it('Deletion not allowed by user who is not register with us', (done) => {
            chai.request(server)
                .delete(`/api/posts/${postId}`)
                .set('Authorization', 'ehJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Mzc2NDIxZjM4MTc1NDFkNmI3YTFkYjQiLCJpYXQiOjE2Njg2OTQ1NTl9.B4FkD2-qDQAErCkmf1uBaX7XeAxb75MsUB-u7-sD0Zg')
                .end((err, res) => {
                    if(err) {
                        console.log(err);
                        done();
                    }
                    res.should.have.status(401)
                    res.body.should.have.property('message').eql("Please authenticate.")
                    done()
                })
        })
        it('Deletion not allowed by user who is registered but is not the owner of post', (done) => {
            chai.request(server)
                .delete(`/api/posts/${postId}`)
                .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Mzc2Mjk3OGE1YmZhNWY3NGI5MzY4NjQiLCJpYXQiOjE2Njg2ODgyNDh9.t0gn2-5rV45DBNlC7tDJO76neuJOowAhJvB7mXuFddY')
                .end((err, res) => {
                    if(err) {
                        console.log(err);
                        done();
                    }
                    res.should.have.status(404)
                    res.body.should.have.property('message').eql("You don't have rights to delete this post")
                    done()
                })
        })
        it('It should delete a post', (done) => {
            chai.request(server)
                .delete(`/api/posts/${postId}`)
                .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2Mzc2NDIxZjM4MTc1NDFkNmI3YTFkYjQiLCJpYXQiOjE2Njg2OTQ1NTl9.B4FkD2-qDQAErCkmf1uBaX7XeAxb75MsUB-u7-sD0Zg')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.have.property('message').eql('Post successfully deleted.')
                    done()
                })
        })
    })
})