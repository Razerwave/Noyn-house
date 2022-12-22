import HomePageBanner from './components/HomeComponents/HomePageBanner/HomePageBanner'
import SmallCard from './utils/Cards/card1/SmallCard'
import Collections from './components/HomeComponents/Collections/Collections'
import PopularPlaces from './components/HomeComponents/PopularPlaces/PopularPlaces'
import GetTheApp from './components/HomeComponents/GetTheApp/GetTheApp'
import ExploreOptionsNearMe from './components/HomeComponents/ExploreOptionsNearMe/ExploreOptionsNearMe'
import Footer from './components/Footer/Footer'
import Header from './components/Header/Header'

import house1 from '/images/house1.jpg'
import house2 from '/images/house2.jpg'
import house3 from '/images/house3.jpg'
import house4 from '/images/house4.jpg'
import house5 from '/images/house5.jpg'
import house6 from '/images/house6.jpg'
import house7 from '/images/house7.jpg'
import house8 from '/images/house8.jpg'
import man from '../src/utils/Cards/Agent/images/businessman.jpg'
import logo from './components/HomeComponents/LatestNews/images/logo.png'
import css from './App.module.css'
import LatestNews from './components/HomeComponents/LatestNews/LatestNews'

import { orderOnlinePage, diningOutPage, proAndProPlusPage, nightLifePage } from './helpers/constants';
import Agent from './utils/Cards/Agent/Agent'

function App() {

  return <>
   
    <HomePageBanner />
    <div className={css.bodySize}>
      <div className={css.chooseTypeCards}>
        <SmallCard imgSrc={house1} text="Order Online" link={"/show-case?page=" + orderOnlinePage} />
        <SmallCard imgSrc={house2} text="Dining Out" link={'/show-case?page=' + diningOutPage} />
        <SmallCard imgSrc={house3} text="Pro and Pro Plus" link={'/show-case?page=' + proAndProPlusPage} />
        <SmallCard imgSrc={house4} text="Night Life and Clubs" link={'/show-case?page=' + nightLifePage} />
        <SmallCard imgSrc={house5} text="Night Life and Clubs" link={'/show-case?page=' + nightLifePage} />
        <SmallCard imgSrc={house6} text="Night Life and Clubs" link={'/show-case?page=' + nightLifePage} />
        <SmallCard imgSrc={house7} text="Night Life and Clubs" link={'/show-case?page=' + nightLifePage} />
        <SmallCard imgSrc={house8} text="Night Life and Clubs" link={'/show-case?page=' + nightLifePage} /> 
      </div>
      {/* <Collections />
      <PopularPlaces /> */}
      <Agent imgSrc={man} text="Edward Hope" email="mugn@gmail.com"/>
      <div className={css.latestNewsCards}>
        <LatestNews imgSrc={house1} text="Order Online" link={"/show-case?page=" + orderOnlinePage}/>
        <LatestNews imgSrc={house2} text="Order Online" link={"/show-case?page=" + orderOnlinePage}/>
      </div>
    </div>
    <GetTheApp />
    {/* <ExploreOptionsNearMe /> */}
    <Footer />
  </>
}

export default App;
