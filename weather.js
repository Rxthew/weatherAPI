
const weatherApp = (function(){
    const submit = document.querySelector('#submitCity')
    const key = 'def79d73d53551dbf22c188d97884e98';
    const parseWeatherData = function(weatherData){
       
        //Array of labels to be used, and object keys from weatherData to return values we need//
        const labelsAndTargets = 
        [
            ['Date', 'dt_txt'],
            ['Forecast', 'description'],
            ['Temperature', 'temp'],
            ['Humidity', 'humidity'],
            ['Feels like', 'feels_like'],


        ];

        const parseIndividualValue = function(someLabelsAndTargets,someFinalArray,weatherListElem){
            for (let someLabelAndTarget of someLabelsAndTargets){
    
                const weatherObj = {};
                
                if(weatherListElem.hasOwnProperty(someLabelAndTarget[1])){
                    weatherObj[someLabelAndTarget[0]] = weatherListElem[someLabelAndTarget[1]];
                    someFinalArray.push(weatherObj); 
                }
                
            }
        }
        
        const parseAllValues = function(){
            const finalArray = []
            for (let elem of weatherData.list){
                parseIndividualValue(labelsAndTargets, finalArray, elem);
                parseIndividualValue(labelsAndTargets, finalArray, elem.main);
                parseIndividualValue(labelsAndTargets, finalArray, elem.weather[0])
            }
            return finalArray; 
        }    

        
        return parseAllValues()    
        
        }
        
    const weatherObjectToDOM = function(finalArray){

        const weatherContainer = document.querySelector('#weatherContainer');

        const convertorFunction = (function(){
            for (let obj of finalArray){
                let component = document.createElement('span');
                let text = document.createElement('p');
                text.textContent = (function(){
                    for (let [key,value] of Object.entries(obj)){
                        return `${key} : ${value}`
                    }  
                })()
                component.appendChild(text)
                weatherContainer.appendChild(component)
            }
        })()


        return
    }    
    
    const weatherData = function(){
                         let city = document.querySelector('#cityInput').value;
                         fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${key}`, {mode:'cors'})
                        .then(function(response){return response.json()})
                        .then(function(info){return parseWeatherData(info)})
                        .then(function(weatherObj){return weatherObjectToDOM(weatherObj)})
    }
    submit.addEventListener('click', weatherData);
})()
