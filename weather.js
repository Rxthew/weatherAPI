
const weatherApp = (function(){
    const submit = document.querySelector('#submitCity')
    const key = 'def79d73d53551dbf22c188d97884e98';
    const malleables = {
        'currentDate': '1500-01-01',
        'benchmarkTime': '25:00:00',
         'hidden' : false
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
        
        const markBenchmarkTime = function(timeString){
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
            let benchmarkTime = markBenchmarkTime(thisTime);
           
            if (currentDate !== thisDate){
                malleables.currentDate = thisDate;
                currentDate = thisDate;
            }
            if (benchmarkTime !== thisTime){
                return [thisTime, currentDate]
            }

            return [dateString, currentDate,thisTime]
    
        }

        const implementTime = function(finalArray){
               
            if (finalArray.length === 0){
                return
            }
            let last = finalArray[finalArray.length - 1];
            if (last.hasOwnProperty('Date')){
 
                //Call timeHarmoniser function
                let dateChecked = timeHarmoniser(last['Date']);
 
                //Update date and time if necessary, else give time instead.
                last['Date'] = dateChecked[0];

 
                if(last['Date'].length < 11){
                    last['Time'] = dateChecked[0];
                    delete last['Date'];
                }
                else {
                    last['Date'] = dateFixer(dateChecked[1]);
                    last['Time'] = dateChecked[2];
                }

            }
        }

        
        return parseAllValues()    
        
        }
       
        
    const weatherObjectToDOM = function(finalArray){

        const weatherContainer = document.querySelector('#weatherContainer');

        const removePriorData = (function(){
            if(weatherContainer.children.length > 0){
                Array.from(weatherContainer.children).forEach(
                    node => node.remove()
                )
            }
        })()

        let toggleLatentData = function(spanElement){
            let hidden = malleables.hidden;
            if (hidden){
                spanElement.classList.toggle('none', true)
            }
        }

        let guardForVisibility = function(obj,component){
            if(obj.hasOwnProperty('Time')){
                if(obj.hasOwnProperty('Date')){
                    malleables.hidden = false;
                    
                }
                else {
                    malleables.hidden = true;
                }
                
            }
            toggleLatentData(component)  
                
        }

        const weatherTextHandler = function(obj,component){
            const dateAndTime = function(){
                component.textContent = `${Object.values(obj)[0]} ${Object.values(obj)[1]}`
                return

            }
            const metricSpecificData = function(){
                if(obj.hasOwnProperty('humidity')){
                    component.textContent = `${Object.entries(obj)[0][1]}% ${Object.entries(obj)[0][0]}`
                    return 
                }
                else if (obj.hasOwnProperty('feels like')){
                    component.textContent = `${Object.entries(obj)[0][0]} ${Object.entries(obj)[0][1]}\u2109`
                    return

                }
                else {
                    component.textContent = `${Object.values(obj)[0]}\u2109`
                    return
                }

            }
            const forecast = function(){
                component.textContent = `${Object.values(obj)[0]}`
                //component.classList.toggle('forecast');
                return

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

                let component = document.createElement('span');
                guardForVisibility(obj, component)
                weatherTextHandler(obj, component)
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
    }
    submit.addEventListener('click', weatherData);
})()
