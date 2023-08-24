/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

import React, { useState, useCallback, useEffect } from 'react';
import { useInfiniteQuery } from 'react-query';
import InfiniteScroll from 'react-infinite-scroll-component';

import { useRecoilValue } from 'recoil';
import { loggedInState } from '../../recoil/AuthState/atoms';

import { fetchVideos, resetTotalResults, VideosResponse, Video } from './YoutubeApi';
import VideoPopup from './VideoPopup';
import AddToBookmark from './AddToBookmark';

import loadingGif from '../../assets/ball-triangle.svg';

const VideoList: React.FC = () => {
    const [category, setCategory] = useState<string>('러닝');
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [favoriteStatus, setFavoriteStatus] = useState<Record<string, boolean>>({});
    const [showModal, setShowModal] = useState<boolean>(false);
    const [currentVideo, setCurrentVideo] = useState<Video | null>(null);

    const isLoggedIn = useRecoilValue(loggedInState);

    useEffect(() => {
        resetTotalResults();
    }, [category]);

    const fetchVideosWrapped = useCallback(
        async ({ pageParam = null }) => {
            const response = await fetchVideos(pageParam, category);

            await new Promise((resolve) => setTimeout(resolve, 800));
            return response;
        },
        [category]
    );

    const { data, isError, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery<
        VideosResponse,
        Error
    >(['videos', category], fetchVideosWrapped, {
        getNextPageParam: (lastPage) => lastPage.nextPageToken || undefined,
        keepPreviousData: true,
        enabled: category !== '',
    });

    const handleFetchMore = useCallback(async () => {
        if (hasNextPage) {
            try {
                await fetchNextPage();
            } catch (error) {
                console.error('Error fetching next page:', error);
            }
        }
    }, [hasNextPage, fetchNextPage]);

    const handleTabClick = useCallback((newCategory: string) => {
        setCategory('');
        resetTotalResults();
        setCategory(newCategory);
    }, []);

    // 팝업창
    const openVideo = useCallback((video: Video) => {
        setSelectedVideo(video);
    }, []);

    const closeVideo = useCallback(() => {
        setSelectedVideo(null);
    }, []);

    //즐겨찾기
    //즐겨찾기 추가 별모양 토클 버튼
    const toggleFavoriteStatus = useCallback(
        (video: Video) => {
            if (!isLoggedIn) {
                alert('로그인 후 이용해주세요.');
                return;
            }

            setFavoriteStatus((prevStatus) => ({
                ...prevStatus,
                [video.id.videoId]: !prevStatus[video.id.videoId],
            }));

            setCurrentVideo(video);
            setShowModal(true);
        },
        // []
        [isLoggedIn]
    );

    return (
        <VideoListInn>
            <PageTitle>운동 정보</PageTitle>
            <BtnTab>
                <button
                    className={`category01 ${category === '러닝' ? 'active' : ''}`}
                    onClick={() => handleTabClick('러닝')}
                >
                    러닝
                </button>
                <button
                    className={`category02 ${category === '등산' ? 'active' : ''}`}
                    onClick={() => handleTabClick('등산')}
                >
                    등산
                </button>
                <button
                    className={`category03 ${category === '헬스' ? 'active' : ''}`}
                    onClick={() => handleTabClick('헬스')}
                >
                    헬스
                </button>
            </BtnTab>
            <VideoSection>
                <VideoGridContainer>
                    {isLoading ? (
                        <Loading>
                            <span className="blind">로딩중입니다...</span>
                        </Loading>
                    ) : isError ? (
                        <ErrorMessage>
                            일일 요청 횟수를 초과하여 영상을 불러올 수 없습니다.
                        </ErrorMessage>
                    ) : (
                        <InfiniteScroll
                            dataLength={
                                data?.pages.reduce((acc, page) => acc + page.items.length, 0) || 0
                            }
                            next={handleFetchMore}
                            hasMore={!!hasNextPage}
                            // loader={<h4>Loading...</h4>}
                            loader={<img src={loadingGif} alt="Loading" />}
                        >
                            {data?.pages.map((page, i) => (
                                <React.Fragment key={i}>
                                    {page.items.map((video: Video) => (
                                        <VideoThumb
                                            key={video.id.videoId}
                                            onClick={() => {
                                                openVideo(video);
                                            }}
                                        >
                                            <h4>
                                                {video.snippet.title.length > 25
                                                    ? `${video.snippet.title.substring(0, 25)}...`
                                                    : video.snippet.title}
                                                <FontAwesomeIcon
                                                    icon={faStar}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        toggleFavoriteStatus(video);
                                                    }}
                                                    className={`star-icon ${
                                                        favoriteStatus[video.id.videoId]
                                                            ? 'opened'
                                                            : ''
                                                    }`}
                                                />
                                            </h4>
                                            <img
                                                src={
                                                    video.snippet.thumbnails.high?.url ||
                                                    video.snippet.thumbnails.default.url
                                                }
                                                alt={video.snippet.title}
                                            />
                                        </VideoThumb>
                                    ))}
                                </React.Fragment>
                            ))}
                        </InfiniteScroll>
                    )}
                </VideoGridContainer>

                {selectedVideo && (
                    <VideoPopup
                        video={{ id: selectedVideo.id.videoId, title: selectedVideo.snippet.title }}
                        onClose={closeVideo}
                    />
                )}
                {showModal && currentVideo && (
                    <AddToBookmark video={currentVideo} onClose={() => setShowModal(false)} />
                )}
            </VideoSection>
        </VideoListInn>
    );
};

const VideoListInn = styled.div`
    position: relative;
    max-width: 1440px;
    min-height: 100vh;
    height: 100%;
    margin: 120px auto 0;
    padding: 20px 60px;
    box-sizing: border-box;
    // background-color: #f8f8f8;
`;
const VideoSection = styled.section`
    position: relative;
`;

const VideoGridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 20px;
    margin: 150px auto 0;
    max-width: 800px;
    text-align: center;
`;
const PageTitle = styled.h2`
    position: relative;

    &::before {
        content: '';
        position: absolute;
        left: 0;
        bottom: -10px;
        width: 100%;
        height: 1px;
        color: #000;
        background-color: #000;
    }
`;
const BtnTab = styled.div`
    margin-top: 10px;
    position: relative;
    top: 60px;
    z-index: 10;

    button {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        border-style: none;
        border-radius: 15px;
        padding: 3px 10px;
        background-color: #fff;
        box-shadow: 2.5px 5px 10px rgba(0, 0, 0, 0.5);

        &.active {
            background-color: #000;
            color: #fff;
        }
    }
    .category01 {
        left: 43.75%;
        transform: translateX(-40%);
    }
    .category03 {
        left: 56.3%;
        transform: translateX(-60%);
    }
`;

const Loading = styled.p`
    padding-top: 100px;
    background: url(${loadingGif}) no-repeat center center;
`;
const ErrorMessage = styled.p`
    padding-top: 100px;
`;

const VideoThumb = styled.div`
    cursor: pointer;
    margin-bottom: 50px;

    h4 {
        display: flex;
        justify-content: space-between;
        align-items: center;

        color: #fff;
        text-align: left;
        text-shadow: 2px 2px 4px #000;
        padding: 8px 15px;
        background-color: #888;
    }
    .star-icon {
        font-size: 20px;
        color: #fff;
        stroke-width: 30px;
    }
    .star-icon.opened {
        color: gold;
        stroke: gold;
    }
    img {
        width: 100%;
    }
`;
export default VideoList;
