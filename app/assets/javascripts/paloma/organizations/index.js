$(document).ready(function(){
  //Hide the organization listing table with links to show page
  $('#tbl-allorg').hide();
  Paloma.start();
});

var getNames = function(data){
  return _.pluck(data, 'name');
};

//Return the fill color of a circle marker based on organization type
var setCircleMarkerColor = function(orgType, fillArea){
  switch(orgType) {
    case "Broadcasters, Producers, TV, Film & Digital Media":
      return fillArea === 'fill' ? '#ffc100' : '#cc9a00';
      break;
    case "Performing Arts":
      return fillArea === 'fill' ? '#e94b6e' : '#e31e49';
      break;
    case "Support & Advocacy":
      return fillArea === 'fill' ? '#ff934f' : '#ff741c';
      break;
    case "Museums, Visual Arts, History":
      return fillArea === 'fill' ? '#2a9aec' : '#1380d0';
      break;
    case "Community":
      return fillArea === 'fill' ? '#228557' : '#185c3c';
      break;
    case "Education":
      return fillArea === 'fill' ? '#532733' : '#30171e';
      break;
    default:
      return 'black';
  }
};

//Return the radius of the circle marker based on organization size
var setCircleMarkerRadius = function(orgSize){
  switch(orgSize) {
    case "Very Small":
      return 5;
      break;
    case "Small":
      return 10;
      break;
    case "Medium":
      return 15;
      break;
    case "Large":
      return 20;
      break;
    case "Very Large":
      return 25;
      break;
    default:
      return 0;
  }
};

var makeMakers = function(organizations, layer){
  return  _.chain(organizations)
           .filter(function(organization){
             return organization.latitude != null;
           })
           .map(function(organization) {
             organization.marker = L.circleMarker([organization.latitude, organization.longitude],
                                     {
                                       'weight': 2,
                                       'opacity': 0.8,
                                       'color': setCircleMarkerColor(organization.org_type, 'stroke'),
                                       'fillColor': setCircleMarkerColor(organization.org_type, 'fill'),
                                       'fillOpacity': 0.5,
                                       'radius': setCircleMarkerRadius(organization.size)
                                     })
                                    .bindPopup(organization.name)
                                    .on('click', function() {
                                      layer.setView([organization.latitude, organization.longitude], 11);
                                      $('#tbl-org-searched').empty();
                                      $("#tbl-allorg #row-"+organization.id).clone().appendTo('#tbl-org-searched');
                                    });
               organization.size_num = setCircleMarkerRadius(organization.size);
             return organization;
           })
           .value();
}

var plotMarkers = function(data, layer){
  return _.map(data, function(datum) { return datum.marker.addTo(layer); });
}

var cleanMarkers = function(markerLayer, layer){
  if(markerLayer){ _.each(markerLayer, function(eachLayer){ layer.removeLayer(eachLayer); }); }
}

var groupData = function(data, field){
  return _.groupBy( data, function(datum){ return datum[field] } );
}



Paloma.controller('Organizations', {
  index: function(){

    //All organizations and their information acquired from the controller
    var organizations = this.params.organizations;

    //All organization names
    var orgNames = getNames(organizations);

    //Marker layers for all organizations and the searched organization
    var layerAllOrgs = [],
        layerVerySmallOrgs = [],
        layerSmallOrgs = [],
        layerMediumOrgs = [],
        layerLargeOrgs = [],
        layerVeryLargeOrgs = [],
        layerSearchedOrg = [];

    //Load the basemap
    var mapAllOrgs = L.map('map-all-orgs', {
      center: [34.0522, -118.2437],
      zoom: 10
    });
    var Stamen_TonerLite = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      minZoom: 0,
      maxZoom: 20,
      ext: 'png'
    }).addTo(mapAllOrgs);

    //Make markers for all organization
    var dataAllOrgs = makeMakers(organizations, mapAllOrgs);

    // Organizations are grouped by size
    var dataGroupedSizeAllOrgs = groupData(dataAllOrgs, 'size_num');

    // Organizations are grouped by type
    var dataGroupedTypeAllOrgs = groupData(dataAllOrgs, 'org_type');

    console.log(dataGroupedSizeAllOrgs);
    console.log(dataGroupedTypeAllOrgs);

    layerVeryLargeOrgs = plotMarkers(dataGroupedSizeAllOrgs['25'], mapAllOrgs);
    layerLargeOrgs = plotMarkers(dataGroupedSizeAllOrgs['20'], mapAllOrgs);
    layerMediumOrgs = plotMarkers(dataGroupedSizeAllOrgs['15'], mapAllOrgs);
    layerSmallOrgs = plotMarkers(dataGroupedSizeAllOrgs['10'], mapAllOrgs);
    layerVerySmallOrgs = plotMarkers(dataGroupedSizeAllOrgs['5'], mapAllOrgs);

    //The search box autocomplete
    $( "#searchbox-org-name" ).autocomplete({
      source: orgNames
    });

    //Search button clicked behaviors
    $('#btn-org-search').on('click',function(){
      //Get the input organization name
      var inputOrgName = $( "#searchbox-org-name" ).val();

      //clear the all organizations and the searched organization marker layer
      cleanMarkers(layerAllOrgs, mapAllOrgs);
      cleanMarkers(layerSearchedOrg, mapAllOrgs);
      cleanMarkers(layerVerySmallOrgs, mapAllOrgs);
      cleanMarkers(layerSmallOrgs, mapAllOrgs);
      cleanMarkers(layerMediumOrgs, mapAllOrgs);
      cleanMarkers(layerLargeOrgs, mapAllOrgs);
      cleanMarkers(layerVeryLargeOrgs, mapAllOrgs);
      layerAllOrgs = [];
      layerSearchedOrg = [];
      layerVerySmallOrgs = [];
      layerSmallOrgs = [];
      layerMediumOrgs = [];
      layerLargeOrgs = [];
      layerVeryLargeOrgs = [];

      //clear the organization information table on the sidebar
      $('#tbl-org-searched').empty();
      //Get the searched organization ID based on name matched with the all organization data
      var searchedOrgID = _.chain(organizations)
                          .filter(function(org){
                            return org.name == inputOrgName;
                          })
                          .pluck('id')
                          .first()
                          .value();

      //add the searched organization marker layer to the map
      layerSearchedOrg = _.chain(organizations)
                          .filter(function(org){
                            return org.id == searchedOrgID;
                          })
                          .map(function(org){
                            mapAllOrgs.setView([org.latitude, org.longitude], 11)
                            return org.marker.addTo(mapAllOrgs);
                          })
                          .value()
      //Look for the hidden organization table row with the searched organization ID
      //Clone it and append it to the organization information table on the sidebar
      //It has the link to take the user to the individual organization page
      $("#tbl-allorg #row-"+searchedOrgID).clone().appendTo('#tbl-org-searched');
    })

    //Add back all organizations to the map
    $('#btn-org-clear').on('click',function(){
      //Clear the organization information table from the sidebar
      $('#tbl-org-searched').empty();
      //Clear the searched organization layer from the map
      cleanMarkers(layerAllOrgs, mapAllOrgs);
      cleanMarkers(layerSearchedOrg, mapAllOrgs);
      cleanMarkers(layerVerySmallOrgs, mapAllOrgs);
      cleanMarkers(layerSmallOrgs, mapAllOrgs);
      cleanMarkers(layerMediumOrgs, mapAllOrgs);
      cleanMarkers(layerLargeOrgs, mapAllOrgs);
      cleanMarkers(layerVeryLargeOrgs, mapAllOrgs);
      layerAllOrgs = [];
      layerSearchedOrg = [];
      layerVerySmallOrgs = [];
      layerSmallOrgs = [];
      layerMediumOrgs = [];
      layerLargeOrgs = [];
      layerVeryLargeOrgs = [];
      //Clear the search box input
      $('#searchbox-org-name').val('');
      //Add back all organizations to the map
      layerVeryLargeOrgs = plotMarkers(dataGroupedSizeAllOrgs['25'], mapAllOrgs);
      layerLargeOrgs = plotMarkers(dataGroupedSizeAllOrgs['20'], mapAllOrgs);
      layerMediumOrgs = plotMarkers(dataGroupedSizeAllOrgs['15'], mapAllOrgs);
      layerSmallOrgs = plotMarkers(dataGroupedSizeAllOrgs['10'], mapAllOrgs);
      layerVerySmallOrgs = plotMarkers(dataGroupedSizeAllOrgs['5'], mapAllOrgs);
      mapAllOrgs.setView([34.0522, -118.2437], 10);
    });
  }
});
