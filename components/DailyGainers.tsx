export{} /*

import {Col, Row} from 'antd';
import React, {useState} from 'react';
import styled from 'styled-components';
import {ReactComponent as GainerIcon} from "../public/assets/illustrations/GainerIcon.svg"
import { RightOutlined } from '@ant-design/icons';
import {Carousel} from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { Link } from 'react-router-dom';
import CoinLogos from '../config/logos.json';

import {
    useDailyGainers
} from '../utils/markets';
import {ReactComponent as RightArrowGainer} from "../assets/img/RightArrowGainer.svg";

const Title = styled.div`
  color: rgba(255, 255, 255, 1);
`;

const Subheader = styled.h2({
    color: '#FFE6CC',
    fontSize: '16px',
    lineHeight: '20px',
    fontFamily: 'Inter',
    marginBottom: '2px',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center'
});

const CoinLogo = styled.img({
    width: '20px !important',
    height: 20,
    marginRight: 4,
});

const GainerTitle = styled.p`
    margin-right: 16px;
    margin-bottom: 0;
`;

const GainerElement = styled.div`
    margin-right: 8px;
    padding: 6px 14px;
    background: #121616;
    border-radius: 8px;
`;

const NextBtn = styled.button`
    background: transparent;
    border: none;
    cursor: pointer;
    position: absolute;
    width: 16px;
    padding: 0;
    right: -12px;
    top: 0;
    bottom: 0;
    background: #121616;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
    text-align: right;
`;

export default function DailyGainers({ parentWidth }) {

    let isSmall = parentWidth < 600;
    let dailyGainers = useDailyGainers(isSmall);
    let dailyGainersList = dailyGainers[0];

    let [carouselPosition, setCarouselPosition] = useState(-1);

    return (
        <Row style={{ width: '545', marginLeft: 'auto', alignItems: 'center', position: 'relative', maxWidth: '100%' }}>
            <Col>
                <GainerTitle>Gainers</GainerTitle>
            </Col>
            <Col>
                <div style={{width: 545}}>
                    <Carousel 
                        showArrows={false} 
                        showThumbs={false} 
                        showIndicators={false} 
                        infiniteLoop={true}
                        selectedItem={carouselPosition}
                        onChange={setCarouselPosition}
                    >
                         @ts-ignore
                        {dailyGainersList && dailyGainersList.map((group: any, index: number) => {
                            return <React.Fragment key={index}>
                                <Row key={index} style={{ flexWrap: 'nowrap' }}>
                                    {group.map(dailyGainer => {
                                        let coinLogoKey = dailyGainer.name.split('/')[0];

                                        return <Col>
                                            <Link to={`/market/${dailyGainer.marketId}`}>
                                                <GainerElement>
                                                    <Subheader>
                                                        {CoinLogos[coinLogoKey] 
                                                            ? <CoinLogo src={CoinLogos[coinLogoKey]} alt={coinLogoKey} /> 
                                                            : ''}
                                                        {dailyGainer ? dailyGainer.name || 0 : '-'}
                                                    </Subheader>
                                                    <span style={{ fontSize: 14, color: '#fff' }}>
                                                        {dailyGainer ? new Intl.NumberFormat('en-US', {
                                                            style: 'currency',
                                                            currency: 'USD',
                                                            minimumFractionDigits: 4
                                                        }).format(dailyGainer.last_price || 0) : '-'}
                                                    </span> 
                                                    <GainerIcon style={{marginLeft: 5, marginRight: 5, marginBottom: 2}}/>
                                                    <span style={{color: '#0AD171'}}>
                                                        {dailyGainer ? new Intl.NumberFormat('en-US', {
                                                            style: 'percent',
                                                            minimumFractionDigits: 2
                                                        }).format(dailyGainer.price_change_24h || 0) : '-'}
                                                    </span>
                                                </GainerElement>
                                            </Link>
                                        </Col>
                                    })}
                                </Row>

                            </React.Fragment>
                        })}

                    </Carousel>
                </div>
            
            </Col>
            <NextBtn onClick={() => {
                let nextCarouselPosition = carouselPosition === -1 
                    ? carouselPosition + 2
                    : carouselPosition + 1;
                return setCarouselPosition(nextCarouselPosition)}
            }>
                <RightOutlined />
            </NextBtn>
        </Row>
    );
        */