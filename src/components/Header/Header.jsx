import React from 'react'
import './style.css';
import { AiOutlineSearch } from "react-icons/ai";


    let Header = (imgSrc) => {
        return (
            <header class="header" data-header>

    <div class="overlay" data-overlay></div>

    <div class="headerTop">
      <div class="container">

        <ul class="headerTopList">

          <li>
            <a href="mailto:info@homeverse.com" class="headerTopLink">
              <ion-icon name="mail-outline"></ion-icon>

              <span>info@homeverse.com</span>
            </a>
          </li>

          <li>
            <a href="#" class="headerTopLink">
              <ion-icon name="location-outline"></ion-icon>

              <address>15/A, Nest Tower, NYC</address>
            </a>
          </li>

        </ul>

        <div class="wrapper">
          <ul class="headerTopSocialList">

            <li>
              <a href="#" class="headerTopSocialLink">
                <ion-icon name="logo-facebook"></ion-icon>
              </a>
            </li>

            <li>
              <a href="#" class="headerTopSocialLink">
                <ion-icon name="logo-twitter"></ion-icon>
              </a>
            </li>

            <li>
              <a href="#" class="headerTopSocialLink">
                <ion-icon name="logo-instagram"></ion-icon>
              </a>
            </li>

            <li>
              <a href="#" class="headerTopSocialLink">
                <ion-icon name="logo-pinterest"></ion-icon>
              </a>
            </li>

          </ul>

          <button class="headerTopBtn">Add Listing</button>
        </div>

      </div>
    </div>

    <div class="headerBottom">
      <div class="container">

        <a href="#" class="logo">
        <img src={imgSrc} alt="Homeverse logo"/>
        </a>

        <nav class="navbar" data-navbar>

          <div class="navbarTop">

            <a href="#" class="logo">
              <img src={imgSrc} alt="Homeverse logo"/>
            </a>

            <button class="navCloseBtn" data-nav-close-btn aria-label="Close Menu">
              <ion-icon name="closeOutline"></ion-icon>
            </button>

          </div>

          <div class="navbarBottom">
            <ul class="navbarList">

              <li>
                <a href="#home" class="navbarLink" data-nav-link>Home</a>
              </li>

              <li>
                <a href="#about" class="navbarLink" data-nav-link>About</a>
              </li>

              <li>
                <a href="#service" class="navbarLink" data-nav-link>Service</a>
              </li>

              <li>
                <a href="#property" class="navbarLink" data-nav-link>Property</a>
              </li>

              <li>
                <a href="#blog" class="navbarLink" data-nav-link>Blog</a>
              </li>

              <li>
                <a href="#contact" class="navbarLink" data-nav-link>Contact</a>
              </li>

            </ul>
          </div>

        </nav>

        <div class="headerBottomActions">

          <button class="headerBottomActionsBtn" aria-label="Search">
           <AiOutlineSearch/>

            <span>Search</span>
          </button>

          <button class="headerBottomActionsBtn" aria-label="Profile">
            <ion-icon name="person-outline"></ion-icon>

            <span>Profile</span>
          </button>

          <button class="headerBottomActionsBtn" aria-label="Cart">
            <ion-icon name="cart-outline"></ion-icon>

            <span>Cart</span>
          </button>

          <button class="headerBottomActionsBtn" data-nav-open-btn aria-label="Open Menu">
            <ion-icon name="menu-outline"></ion-icon>

            <span>Menu</span>
          </button>

        </div>

      </div>
    </div>

  </header>
           
        )
            
         
    }
    

export default Header;

