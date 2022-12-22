import React from 'react'
import css from './agent.css'
const Agent = ({}) => {
    return (
        <div class="agent-content">
            <div class="image">
                <img class="person" src={props.imgSrc}/>
            </div>
            <div class="desc">
                <div class="name">
                    <span>{props.text}</span>
                </div>
                <div class="contact">
                    <span>
                    <i class="fa fa-envelope"></i> <a href="mailto:Nyambat@mggproperties.com">{props.email}</a>
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Agent