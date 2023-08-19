/** @jsxImportSource @emotion/react */
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { css } from '@emotion/react';
import PostListItem from '../common/PostListItem';
import styled from '@emotion/styled';
import axios from 'axios';
import { useRecoilState } from 'recoil';
import { postListDataState } from '../../recoil/posts/atoms';

const PostList: React.FC = () => {
    function ScrollToTopOnPageChange() {
        const { pathname } = useLocation();

        useEffect(() => {
            window.scrollTo(0, 0); // Scroll to the top on route change
        }, [pathname]);

        return null;
    }

    const [page, setPage] = useState<number>(1); // 현재 페이지
    const [postListData, setPostListData] = useRecoilState(postListDataState); // 게시글 데이터
    const limit: number = 5; // 한 페이지에 담길 수 있는 최대 PostListItem

    const getPostListData = async () => {
        try {
            const response = await axios.get('/api/posts/search');
            setPostListData(response.data);
        } catch (error) {
            console.error;
        }
    };

    useEffect(() => {
        getPostListData();
    }, []);

    const dataArrayLength: number = postListData ? postListData.length : 0; // 데이터 배열의 길이. 즉, 총 PostListItem 수
    const offset: number = (page - 1) * limit; // 각 페이지의 첫번째 PostlistItem의 Index
    const numPages: number = Math.ceil(dataArrayLength / limit); // 총 페이지 수

    const currentPageGroup: number = Math.ceil(page / 5); // 현재 페이지 그룹
    const startPage: number = (currentPageGroup - 1) * 5 + 1; // 현재 페이지 그룹에서 시작페이지
    const endPage: number = Math.min(currentPageGroup * 5, numPages); // 현재 페이지 그룹에서 마지막 페이지

    console.log('PostList에서 프롭스 넘어가기 전 postListData', postListData);
    return (
        <PostListComponent>
            <ScrollToTopOnPageChange />
            <PostListItems>
                {postListData ? (
                    postListData
                        .slice(offset, offset + limit)
                        .map((post) => <PostListItem key={post.postId} {...post} />)
                ) : (
                    <div>Loading...</div>
                )}
            </PostListItems>
            <ButtonGroup>
                <PaginationButtonArrow onClick={() => setPage(page - 1)} disabled={page === 1}>
                    &lt;
                </PaginationButtonArrow>
                {Array.from(
                    { length: endPage - startPage + 1 },
                    (_, index) => startPage + index
                ).map((item) => (
                    <PaginationButtonNumber
                        key={item}
                        onClick={() => setPage(item)}
                        css={item === page ? selectedButton : unselectedButton}
                    >
                        {item}
                    </PaginationButtonNumber>
                ))}
                <PaginationButtonArrow
                    onClick={() => setPage(page + 1)}
                    disabled={page === numPages}
                >
                    &gt;
                </PaginationButtonArrow>
            </ButtonGroup>
        </PostListComponent>
    );
};

const PostListComponent = styled.div``;

const PostListItems = styled.div`
    width: 750px;
`;

const ButtonGroup = styled.div`
    width: max-content;
    margin: 0 auto;
`;

const PaginationButtonNumber = styled.button`
    width: 25px;
    background-color: #d7d7d7;
    border: 1px solid treansparent;
    border-style: none;
    border-radius: 5px;
    margin: 3px;
    cursor: pointer;
    color: #666666;
    &:hover {
        background-color: #a1c9e4;
    }
    box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5); /* 그림자 추가 */
`;

const PaginationButtonArrow = styled.button`
    width: 25px;
    border: 0px;
    background-color: transparent;
    color: #a7a7a7;
    font-weight: bold;
`;

const unselectedButton = css``;

const selectedButton = css`
    font-weight: bold;
`;

export default PostList;
