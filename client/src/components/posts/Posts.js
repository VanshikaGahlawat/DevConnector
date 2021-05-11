import React, {Fragment, useEffect} from 'react'
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {getPosts} from '../../actions/post';
import Spinner from '../layouts/Spinner';
import PostItem from './PostItem';
import PostForm from './PostForm'

const Posts = ({post: {posts, loading}, getPosts}) => {

    useEffect(() => {
        getPosts();
    }, [getPosts])

    return (
        loading ? <Spinner /> : <Fragment>
            <h1 class="large text-primary">Posts</h1>
            <p className='fas fa-user'> Welcome to the community</p>
            <PostForm />
            <div className='posts'>
                {posts.map( post => (
                    <PostItem post={post} key={post._id} />
                ))}
            </div>
        </Fragment>
    )
}

Posts.propTypes = {
    getPosts: PropTypes.func.isRequired,
    post: PropTypes.object.isRequired
}

const mapStateToProps= state =>({
    post: state.post
});

export default connect(mapStateToProps, {getPosts})(Posts);
