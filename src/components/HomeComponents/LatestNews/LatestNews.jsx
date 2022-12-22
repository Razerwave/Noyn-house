import React from 'react'
import { Link } from 'react-router-dom'
import css from './latestNews.module.css';

    let LatestNews = ({ imgSrc, text, link }) => {
        return (
        <Link to={link} className={css.card}>
          <div className='asdsda'>
              <div className={css.imgBox} >
                <img src={imgSrc} alt="card image" className={css.img} />
            </div>
            <div className='asd'>
            <div className={css.txtBx}>
                <div className={css.txt}>{text}</div>
                <a href='#'>Read More</a>
            </div>
            </div>
        
          </div>
        </Link>
           
        )
            
         
    }
    

export default LatestNews;
