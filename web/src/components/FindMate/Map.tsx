import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';
import UserProfile from './UserProfile';

export interface User {
    id: number;
    category: string;
    gender: boolean;
    lat: number;
    long: number;
}
interface MapProps {
    category: string;
}

const Map = (props: MapProps) => {
    //tab click
    const [category, setCategory] = useState<string>(props.category || '러닝');
    // map
    const kakaoMapRef = useRef<HTMLDivElement | null>(null);
    //user marker
    const [users, setUsers] = useState<User[]>([]);
    // user click
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleTabClick = (newCategory: string) => {
        setCategory(newCategory);
        setSelectedUser(null);
    };

    useEffect(() => {
        fetch('http://localhost:3001/usersInfo')
            .then((response) => response.json())
            .then((data: User[]) => setUsers(data))
            .catch((error) => {
                console.error('Error fetching users:', error);
            });
    }, []);

    useEffect(() => {
        if (!kakaoMapRef.current) {
            return;
        }

        // 현재 위치 가져오기
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLong = position.coords.longitude;

                    const targetPoint = new kakao.maps.LatLng(userLat, userLong);

                    const options = {
                        center: targetPoint,
                        level: 3,
                    };
                    const map = new window.kakao.maps.Map(kakaoMapRef.current, options);

                    users
                        .filter((user) => user.category === category)
                        .forEach((user) => {
                            const markerPosition = new kakao.maps.LatLng(user.lat, user.long);
                            const marker = new kakao.maps.Marker({
                                position: markerPosition,
                            });
                            marker.setMap(map);

                            kakao.maps.event.addListener(marker, 'click', function () {
                                setSelectedUser(user);
                            });
                        });

                    console.log('Creating map...');
                },
                (error) => {
                    console.error('Error getting current position:', error);
                }
            );
        }
    }, [users, category]);

    const handleClose = () => {
        setSelectedUser(null);
    };

    return (
        <MapContainer isSidebarOpen={selectedUser !== null}>
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
            <MapBox ref={kakaoMapRef} isSidebarOpen={selectedUser !== null}></MapBox>
            {selectedUser && (
                <UserProfileWrapper>
                    <UserProfile user={selectedUser} onClose={handleClose} />
                </UserProfileWrapper>
            )}
        </MapContainer>
    );
};

const MapContainer = styled.div<{ isSidebarOpen: boolean }>`
    position: relative;
    max-width: 1440px;
    height: 100%;
    margin: 0px auto;
    padding: 20px 60px;
    box-sizing: border-box;
    background-color: #f8f8f8;
    transition: all 0.3s;
`;

const BtnTab = styled.div`
    position: relative;
    top: 30px;
    z-index: 10;
    button {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        border: 1px solid #000;
        border-radius: 20px;
        padding: 4px 20px;
        background-color: #fff;

        &.active {
            background-color: #000;
            color: #fff;
        }
    }
    .category01 {
        left: 40%;
        transform: translateX(-40%);
    }
    .category03 {
        left: 60%;
        transform: translateX(-60%);
    }
`;
const MapBox = styled.div<{ isSidebarOpen: boolean }>`
    position: absolute;
    top: 130px;
    // left: 50%;
    // transform: translateX(-50%);

    // width: ${(props) => (props.isSidebarOpen ? '50%' : '70%')};
    width: 70%;
    height: 70%;

    border-radius: 10px;
    transition: all 0.3s;

    left: ${(props) => (props.isSidebarOpen ? '40%' : '50%')};
    transform: translateX(${(props) => (props.isSidebarOpen ? '-50%' : '-50%')});
`;

//프로필
const UserProfileWrapper = styled.div`
    position: absolute;
    right: -120px;
    top: 200px;
    width: 30%;
    height: 100%;
`;

export default Map;
