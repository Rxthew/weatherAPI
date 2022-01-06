
const weatherApp = (function(){
    const submit = document.querySelector('#submitCity')
    const key = 'def79d73d53551dbf22c188d97884e98';
    const parseWeatherData = function(weatherData){
       
        //Array of labels to be used, and object keys from weatherData to return values we need//
        const labelsAndTargets = 
        [
            ['Date', 'dt_txt']
            //populate more.
        ];

        const parseIndividualValue = function(someLabelsAndTargets,someFinalArray,weatherListElem){
            for (let elemArr of someLabelsAndTargets){
                const weatherObj = {};
                weatherObj[elemArr[0]] = weatherListElem[elemArr[1]]
                someFinalArray.push(weatherObj) 
                return weatherObj
            }
        }
        
        const parseAllValues = function(){
            const finalArray = []
            for (let elem of weatherData.list){
                parseIndividualValue(labelsAndTargets, finalArray, elem)
            }
            return finalArray; 
        }    

        
        return parseAllValues()    
        
        }     
    
    const weatherData = function(){
                         let city = document.querySelector('#cityInput').value;
                         fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&APPID=${key}`, {mode:'cors'})
                        .then(function(response){return response.json()})
                        .then(function(info){console.log(parseWeatherData(info))})
    }
    submit.addEventListener('click', weatherData);
})()
