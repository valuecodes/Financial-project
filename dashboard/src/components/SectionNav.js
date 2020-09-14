import React from 'react'
import { camelCaseToString } from '../utils/utils';

export default function SectionNav({navigation,setNavigation}){
    return(
        <nav className='sectionNav'>
            <ul>
                {navigation.options.map((item,index)=>
                    <li
                        key={item}
                        style={{
                            backgroundColor:item===navigation.selected.name&&'rgba(0, 0, 0, 0.2)',
                            borderBottom:item===navigation.selected.name&&'0.2rem solid lightgreen'
                        }}
                        onClick={() => setNavigation({...navigation,selected:{name:item,index}})}
                    >{camelCaseToString(item)}</li>
                )}
            </ul>
        </nav>
    )
}
