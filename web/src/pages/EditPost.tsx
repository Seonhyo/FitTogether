import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { useLocation } from 'react-router-dom';
import QuillEditor from '../components/CreatePost,EditPost/QuillEditor';
import PostSetting from '../components/CreatePost,EditPost/PostSetting';
import { useRecoilValue } from 'recoil';
import {
    titleState,
    descriptionState,
    imagesUrlListState,
    hashtagListState,
    categoryState,
    accessLevelState,
} from '../recoil/posts/atoms';

interface DataForEdit {
    savedTitle: string;
    savedDescription: string;
    savedHashtagList: string[];
    savedCategory: string;
    savedAccessLevel: boolean;
    savedImages: string[];
}

const EditPost: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const { postId } = useParams<{ postId: string }>();
    const navigate = useNavigate();
    const token = sessionStorage.getItem('token');

    const title = useRecoilValue(titleState);
    const description = useRecoilValue(descriptionState);
    const images = useRecoilValue(imagesUrlListState);
    const hashtagList = useRecoilValue(hashtagListState);
    const category = useRecoilValue(categoryState);
    const accessLevel = useRecoilValue(accessLevelState);

    const location = useLocation();
    const dataForEdit: DataForEdit = location.state.dataForEdit;
    console.log('dataForEdit', dataForEdit);
    const {
        savedTitle,
        savedDescription,
        savedImages,
        savedHashtagList,
        savedCategory,
        savedAccessLevel,
    } = dataForEdit;

    const dataForQuillEditorComp = { savedTitle, savedDescription, savedImages };
    const dataForPostSettingComp = { savedHashtagList, savedCategory, savedAccessLevel };

    const postForm = {
        title: title,
        description: description,
        images: images,
        hashtag: hashtagList,
        category: category,
        accessLevel: accessLevel,
    };
    console.log(postForm);

    const submitPostForm = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            console.log(token);
            const response = await axios.put(`/api/posts/${postId}`, postForm, {
                headers: {
                    'X-AUTH-TOKEN': token,
                },
            });
            if (response.status === 200) {
                navigate(`/posts/${postId}`);
            }
        } catch (error) {
            console.error(error);
            window.alert('카테고리를 설정하세요');
        }
    };

    return (
        <PostDataForm onSubmit={submitPostForm}>
            <Title>게시글 수정</Title>
            <QuillEditor {...dataForQuillEditorComp} />
            <PostSetting {...dataForPostSettingComp} />
            <SubmitButton type="submit">수정</SubmitButton>
        </PostDataForm>
    );
};

const Title = styled.h2`
    width: 850px;
`;

const PostDataForm = styled.form`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    margin: 150px auto;
    min-height: calc(100vh - 300px);
`;

const SubmitButton = styled.button`
    position: relative;
    left: 400px;
    padding: 0 10px;
    border-style: none;
    border-radius: 15px;
    margin: 5px;
    background-color: #d7d7d7;
    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.3);
    &: hover {
        box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.8);
    }
`;

export default EditPost;
