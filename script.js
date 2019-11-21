const hikeApp = {};

const routeKey = `Aia7N7IYQAD2wuOi_t3bwY9x9AqsymMip5UUZSY_OhyJF9uYSkjb3UkwFhIVP7nJ`
const geoKey = `51b65eec5dc1479abcc1262f017405a2`

let postalCode = " "

const totalTime = function (seconds){
    const hours = Math.floor(seconds/3600);
    const minutes = Math.round((seconds %= 3600)/60);
    return `${hours} h ${minutes} min`
};

const getCoordinates = function(postalCode) {

     postalCode = $("input").val();

    $.ajax({
        url:`http://dev.virtualearth.net/REST/v1/Locations/CA/-/${postalCode}/-/-`,
        method: "GET",
        dataTypes: 'json',
        data:{
            key: routeKey
        }
    }).then(function(data){
        const dLat = data.resourceSets[0].resources[0].point.coordinates[0];
        const dLong = data.resourceSets[0].resources[0].point.coordinates[1];
        console.log(dLat, dLong);

        $.when(getCoordinates)
        .then(function(){
            getHikes (dLat, dLong);
        })
    }).fail(function(error){
        console.log(error);
    });
};

hikeApp.baseUrl = 'https://www.hikingproject.com/data/get-trails';
hikeApp.key = '200640927-0078512b6eac032c4ea121fea696b36f';

const getHikes = function(dLat, dLong) {
    $.ajax({
        url: hikeApp.baseUrl, 
        method: 'GET',
        dataType: 'json',
        data: {
            key: hikeApp.key, 
            lat: dLat,
            lon: dLong
        }
    }).then( function(hikeData){
        
        console.log(hikeData)
        for(i=0;i<hikeData.trails[i].length;i++){
 
            const hikeName = (hikeData.trails[i].name);
            const hikeSummary = (hikeData.trails[i].summary);
            const hikeLocation = (hikeData.trails[i].location);
            const hikeImage = (hikeData.trails[i].imgSmallMed)
            const hikeWebsite = (hikeData.trails[i].url)
            const hikeStars = (hikeData.trails[i].starVotes)/10
            const aLat = hikeData.trails[i].latitude;
            const aLong = hikeData.trails[i].longitude;
            getRoute(dLat,dLong,aLat,aLong);
    
            $.when(getRoute)
            .then(function(){
                const hikeInfo = `
                <a href=${hikeWebsite}>
                    <img src="${hikeImage}" alt="${hikeName}">
                    <h2>${hikeName}</h2>
                </a>
                <p>${hikeStars} Stars ${hikeLocation}</p>
                <p>Ascent: ${hikeData.trails[i].ascent}, Descent: ${hikeData.trails[i].descent}</p>
                <p>${hikeSummary}</p>
                <div class ="travel-info"></div>`
                $(".results").append(hikeInfo)
            })
        }
    })
}	

const getRoute = function(dLat, dLong, aLat, aLong) {

const depart = dLat + ",%20" + dLong
const arrive = aLat + ",%20" + aLong

$.ajax({
    url:`http://dev.virtualearth.net/REST/V1/Routes/Driving?wp.0=${depart}&wp.1=${arrive}`,
    method: "GET",
    dataTypes: 'json',
    data:{
        avoid: "minimizeTolls",
        key: routeKey
        }
    }).then(function(result){

        hikeApp.displayRoute(result);

    }).fail(function(error){
        console.log(error);
    });
};

hikeApp.displayRoute = function (result){

        const driveDistance = result.resourceSets[0].resources[0].travelDistance;
        const driveTimeSeconds = result.resourceSets[0].resources[0].travelDuration;
        const driveTrafficSeconds = result.resourceSets[0].resources[0].travelDurationTraffic;

        const travelInfo = `
        <p>Distance: ${driveDistance} km</p>
        <p>Estimated Drive Time: ${totalTime(driveTimeSeconds)}</p>
        <p>With Traffic: ${totalTime(driveTrafficSeconds)}</p>
        `

        $(".travel-info").append(travelInfo);
}

$(function(){
    $("input[type='submit']").on("click", function(){
        $(".results").html(" ")
        getCoordinates(postalCode);
    })
});

//////////