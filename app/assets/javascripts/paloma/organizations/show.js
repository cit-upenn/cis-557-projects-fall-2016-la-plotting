$(document).ready(function(){
  Paloma.start();
});

Paloma.controller('Organizations', {
  show: function(){
    //variables from the controller
    var organization = this.params.organization;
    var restaurants = this.params.restaurants;

    //marker layers
    var layerOneOrg = [],
        layerRestaurants = [];

    //Load the basemap
    var mapOneOrg = L.map('map-one-org', {
      center: [34.0522, -118.2437],
      zoom: 9
    });
    var Stamen_TonerLite = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      minZoom: 0,
      maxZoom: 20,
      ext: 'png'
    }).addTo(mapOneOrg);

    //Add a marker for this organization
    organization.marker = L.marker([organization.latitude, organization.longitude],{ icon: L.divIcon({ className: organization.org_type.split(',')[0].split(' ')[0] }) }).bindPopup(organization.name);

    // Plot this organization marker to the map, set this organization as map center
    layerOneOrg = organization.marker.addTo(mapOneOrg);
    mapOneOrg.setView([organization.latitude, organization.longitude], 14)

    // Add markers for all restaurants
    var markerRestaurants = _.map(restaurants.businesses, function(biz){
      return biz.marker = L.marker([biz.coordinates.latitude, biz.coordinates.longitude],{ icon: L.divIcon({ className: 'nearby-res' }) }).bindPopup(biz.name);
    });

    // if the user clicks the nearby restaurants checkbox, show these markers on the map
    // show the restaurants information on the side bar
    $('#ck-nearby-restaurants').on('click', function(){

      var isChecked = $(this).prop('checked');

      if(isChecked){
        //empty the sidebar restaurants information table
        $('#yelp-restaurants').empty();
        //remove the restaurants marker layer if any
        if(layerRestaurants){
          _.each(layerRestaurants, function(res){
            mapOneOrg.removeLayer(res);
          })
        }
        //add the restaurants marker layer to the map
        layerRestaurants = _.map(restaurants.businesses, function(biz){
          return biz.marker.addTo(mapOneOrg);
        });
        //construct the restaurants information tables, append to the corresponding sidebar div
        _.each(restaurants.businesses, function(biz){
          var phone;
          //if the phone number exists, rewrite it in a more readable way
          if(biz.phone){
            phone = '(' + biz.phone.slice(2, 5) + ') - ' + biz.phone.slice(5,8) + ' - ' +  biz.phone.slice(8, 12);
          }else{
            phone = "";
          }
          //in case the price dollar signs are empty
          var price = (biz.price == '' ? '' : biz.price);
          //the html table to append
          //the restaurant name should be linked to its Yelp page, will open a new tab
          var html = "<table class='tbl-yelp-restaurant' id='" + biz.id + "'>"
                   + "<tr><td style='font-weight:bold'><a target='_blank' href='" + biz.url + "'>" + biz.name + "  " + price + "</a></td></tr>"
                   + "<tr><td style=''>" + biz.categories[0].title + "</td></tr>"
                   + "<tr><td style=''>Yelp Score:" + biz.rating + "</td></tr>"
                   + "<tr><td style=''>" + phone + "</td></tr>"
                   + "<tr><td style=''>" + biz.location.address1 + ", " + biz.location.city + ", " + biz.location.state + " " + biz.location.zip_code + "</td></tr>"
                   + "</table>";
          //append the html table to the predefined sidebar div
          $('#yelp-restaurants').append(html);
        });

        //if the user hovers on the restaurant on the sidebar, its marker popup will show on map
        $('.tbl-yelp-restaurant').on('mouseover', function(){
          var bizId = $(this).attr('id');
          var hoveredRestaurant = _.chain(restaurants.businesses).filter(function(biz){ return biz.id == bizId; }).first().value();
          hoveredRestaurant.marker.openPopup();
        });
      }else{
        //if the nearby restaurants checkbox is unchecked
        //clear the sidebar restaurants information tables
        $('#yelp-restaurants').empty();
        //remove the restaurants marker layer from the map
        if(layerRestaurants){
          _.each(layerRestaurants, function(res){
            mapOneOrg.removeLayer(res);
          })
        }
        //set the veiw back to the initial mode
        mapOneOrg.setView([organization.latitude, organization.longitude], 14)
      }
    })
  }
})
