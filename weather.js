
const weatherApp = (function(){
    const submit = document.querySelector('#submitCity')
    const weatherContainer = document.querySelector('#weatherContainer');
    const key = 'def79d73d53551dbf22c188d97884e98';
    const malleables = {
        'currentDate': '1500-01-01',
        'benchmarkTime': '25:00:00',
         'hidden' : false
    }

    const removePriorData = function(){
        if(weatherContainer.children.length > 0){
            Array.from(weatherContainer.children).forEach(
                node => node.remove()
            )
        }
    }

    const parseWeatherData = function(weatherData){
       
        //Array of labels to be used, and object keys from weatherData to return values we need//
        const labelsAndTargets = 
        [
            ['Date', 'dt_txt'],
            ['Forecast', 'description'],
            ['Temperature', 'temp'],
            ['humidity', 'humidity'],
            ['feels like', 'feels_like'],


        ];

        
        const parseIndividualValue = function(someLabelsAndTargets,someFinalArray,weatherListElem){
            for (let someLabelAndTarget of someLabelsAndTargets){
    
                const weatherObj = {};
                let label = someLabelAndTarget[0];
                let target = someLabelAndTarget[1];
                
                if(weatherListElem.hasOwnProperty(target)){

                    weatherObj[label] = weatherListElem[target];
                    someFinalArray.push(weatherObj); 
                }
                
            }
        }
        
        const parseAllValues = function(){
            const finalArray = []
            

            for (let elem of weatherData.list){
                parseIndividualValue(labelsAndTargets, finalArray, elem);
                implementTime(finalArray);
                parseIndividualValue(labelsAndTargets, finalArray, elem.main);
                parseIndividualValue(labelsAndTargets, finalArray, elem.weather[0])
            }
            return finalArray; 
        }
        
        const setBenchmarkTime = function(timeString){
               let benchmarkTime = malleables.benchmarkTime;
            if (benchmarkTime === '25:00:00'){
                malleables.benchmarkTime = timeString
            }
            return malleables.benchmarkTime
        }

        const dateFixer = function(date){
            const newDate = new Date(date);
            const fixedDate = newDate.toString().slice(0,15);
            return fixedDate

        }
        
        const timeHarmoniser = function(dateString){

            const thisDate = dateString.slice(0,10);
            const thisTime = dateString.slice(11,)
            let currentDate = malleables.currentDate;
            let benchmarkTime = setBenchmarkTime(thisTime);
           
            if (currentDate !== thisDate){
                malleables.currentDate = thisDate;
                currentDate = thisDate;
            }

            return [currentDate,thisTime]
    
        }

        const implementTime = function(finalArray){
               
            if (finalArray.length === 0){
                return
            }
            let last = finalArray[finalArray.length - 1];
            if (last.hasOwnProperty('Date')){
 
                //Call timeHarmoniser function
                let dateChecked = timeHarmoniser(last['Date']);
 
                //Update date and time to correct format.
                last['Date'] = dateFixer(dateChecked[0]);
                last['Time'] = dateChecked[1];

            }
        }

        
        return parseAllValues()    
        
        }
       
        
    const weatherObjectToDOM = function(finalArray){

        const removeLoadingSpinner = (function(){
            let spinner = document.querySelector('#spin')
            if(spinner){
                spinner.remove()
            }
            return
        })()
        removePriorData();

        let toggleHideData = function(someElement){
            let hidden = malleables.hidden;
            if (hidden){
                someElement.classList.toggle('none', true)
            }
        }

        let guardForVisibility = function(obj,component){
            if(obj.hasOwnProperty('Time')){
                if(obj['Time'] === malleables.benchmarkTime){
                    malleables.hidden = false;
                    
                }
                else {
                    malleables.hidden = true;
                }
                
            }
            toggleHideData(component)  
                
        }

        const timeToggler = function(){
            //two buttons attached to a Time component: next and previous
            // Next -> 1. goes up tree until get to card div.
            // 2. Finds the index of event's target 'Time' span within card's children
            // 3. Toggle none on that Time component
            // 4. Starts there iterating through card div's children, looking for next Time class. 
            // 4.5 In the meantime, if it's not a time class then toggle none
            // 4. Once next time class is found toggle none off on that time class
            // 5. Keep iterating and toggling time off on the next elements until you reach the next Time.
            //2 problems:
            // also: what if the Time is 21:00
            return
        }

        const componentHandler = function(obj){

            const dateAndTime = function(){
                let div = document.createElement('div');
                div.classList.toggle('Time',true)

               const dateText = (function(){
                   let dateComponent = document.createElement('span');
                   dateComponent.textContent = `${Object.values(obj)[0]}`;
                   dateComponent.classList.toggle('dateText',true)
                   div.appendChild(dateComponent);
               })()

                const earlierButton = (function(){
                    let earlier = document.createElement('button');
                    earlier.textContent = 'Earlier';
                    earlier.classList.toggle('earlier',true);
                    earlier.addEventListener('click',timeToggler)
                    div.appendChild(earlier);                   
                })()
            
                const timeText = (function(){
                    let component = document.createElement('input');
                    component.setAttribute('type','text');
                    component.setAttribute('readonly',true);
                    component.value = `${Object.values(obj)[1]}`
                    component.classList.toggle('timeText',true)
                    div.appendChild(component);
                    
                })()

                const laterButton = (function(){
                    let later = document.createElement('button');
                    later.textContent = 'Later';
                    later.classList.toggle('later',true);
                    later.addEventListener('click',timeToggler)
                    div.appendChild(later);
                    
                })()

                return div

            }
            const metricSpecificData = function(){
                let component = document.createElement('span');
                if(obj.hasOwnProperty('humidity')){
                    component.textContent = `${Object.entries(obj)[0][1]}% ${Object.entries(obj)[0][0]}`;
                    component.classList.toggle(`${Object.entries(obj)[0][0]}`,true);
                    return component
                }
                else if (obj.hasOwnProperty('feels like')){
                    component.textContent = `${Object.entries(obj)[0][0]} ${Object.entries(obj)[0][1]}\u2109`;
                    component.classList.toggle('feelsLike',true)
                    return component

                }
                else {
                    component.textContent = `${Object.values(obj)[0]}\u2109`;
                    component.classList.toggle(`${Object.keys(obj)[0]}`,true)
                    return component
                }

            }
            const forecast = function(){
                let component = document.createElement('span');
                component.textContent = `${Object.values(obj)[0]}`
                component.classList.toggle(`${Object.keys(obj)[0]}`,true)
                return component

            }

            const writeAccordingToOutcome = (function(){
                if (obj.hasOwnProperty('Forecast')){
                    return forecast();
                }
                else if(obj.hasOwnProperty('Time')){
                    return dateAndTime();
                }
                else{
                    return metricSpecificData();
                }
            })()

            return writeAccordingToOutcome
        }
        
        const convertorFunction = (function(){

            const secondaryContainer = (function(){
                const secondary = document.createElement('div');
                secondary.id = 'secondaryContainer';
                weatherContainer.appendChild(secondary);
                return secondary;
            })()
               
            for (let obj of finalArray){
                
                let card = (function(){
                    if(weatherContainer.children.length === 1 || obj['Time'] === '00:00:00'){
                        let div =  document.createElement('div');
                        div.classList.toggle('card',true);
                        return div;
                    }
                    if (secondaryContainer.children.length !== 0){
                        return secondaryContainer.children[secondaryContainer.children.length - 1]
                    }
                    return document.querySelector('.mainCard')
                })()
                
                let component = componentHandler(obj)
                guardForVisibility(obj, component)
                card.appendChild(component)

                
                const mainOrSecondary = (function(){

                    const weatherContChildren = Array.from(weatherContainer.children);
                    const secondaryContChildren = Array.from(secondaryContainer.children);

                    if(weatherContainer.children.length === 1){
                        card.classList.toggle('mainCard', true)

                        if(!weatherContChildren.includes(card)){
                        weatherContainer.appendChild(card);
                        }
                    }
                    else{
                        if(!weatherContChildren.includes(card) && !secondaryContChildren.includes(card)){
                            secondaryContainer.appendChild(card);
                        }                            
                    }
                }())
                
            }
        })()

        return
    }    
    
    const weatherData = function(){
                         let city = document.querySelector('#cityInput').value;
                         fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${key}`, {mode:'cors'})
                        .then(function(response){return response.json()})
                        //.then(function(info){console.log(parseWeatherData(info))})
                        .then(function(info){return parseWeatherData(info)})
                        .then(function(weatherObj){return weatherObjectToDOM(weatherObj)})

                        const loader = (function(){
                            if(document.querySelector("#spin")){
                                return
                            }
                            removePriorData()
                            const spinner = document.createElement('div');
                            spinner.id = 'spin'
                            weatherContainer.appendChild(spinner);
                        })()
    }
    submit.addEventListener('click', weatherData);
})()
