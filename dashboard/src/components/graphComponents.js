import React,{useEffect} from 'react'

export function SetTimePeriod({time,setTime}) {

    useEffect(() => {
        changeTimePeriod('1.years')
    }, [])

    function changeTimePeriod(value){
        const number = value.split('.')[0]
        const period = value.split('.')[1]

        let selectedTime=new Date()
        switch(period){
            case 'months':
                selectedTime.setMonth(selectedTime.getMonth()- number);
                break 
            case 'years':
                selectedTime.setFullYear(selectedTime.getFullYear() - number);   
                break  
            default: selectedTime.setFullYear(selectedTime.getFullYear() - 1);  
        }
        setTime({
            value,
            time:selectedTime
        })
    }

    const timePeriods=['3.months', '6.months','1.years','3.years','5.years','10.years','20.years']

    return (
        <div>
            {timePeriods.map(period =>
                <button  
                style={{backgroundColor:time.value===period&&'lightgreen'}}
                onClick={()=>changeTimePeriod(period)}>{period.replace('.',' ')}</button>
            )}
        </div>
    )
}
