import React, { useState } from 'react';
import { WeekList, DayOfWeek, Day, Number, Binds} from './DateSelection-style.js'
const dayjs = require('dayjs')
var updateLocale = require('dayjs/plugin/updateLocale')
dayjs.extend(updateLocale)

dayjs.updateLocale('en', {
    weekdaysShort: ["DOM", "LUN", "MAR", "MER", "GIO", "VEN", "SAB"]
})

function getWeek(){
    let week = [];
    for(let i=0;i<7;i++){
        const d = dayjs().add(i, 'day')
        let item = {
            'number': d.format('DD'),
            'day': d.format('ddd')
        }
        week.push(item);
    }
    return week
}


function DateSelection({ selDay, changeDay}) {

    return (
        <WeekList>
            {getWeek().map((item,key) => {
                return(
                    <DayOfWeek key={key} onClick={()=>changeDay(key)} selected={selDay==key}>
                        <Binds/>
                        <Day>{item.day}</Day>
                        <Number>{item.number}</Number>
                    </DayOfWeek>
                )})}
        </WeekList>
    );
}

export default DateSelection;