$(document).ready(function(){
  //Hide the organization listing table with links to show page
  $('#tbl-allorg').hide();
  $('#tbl-org-type-switch').hide();
  $('#tbl-org-size-switch').hide();
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
      return fillArea === 'fill' ? '#572285' : '#3c185c';
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

var autoComplete = function(names){
  $( "#searchbox-org-name" ).autocomplete({
    source: names,
    minLength: 3,
    delay: 500
  });
}


Paloma.controller('Organizations', {
  index: function(){

    //----------------------------------------------------------------------------
    //All organizations and their information acquired from the controller
    //----------------------------------------------------------------------------
    var organizations = this.params.organizations;

    //----------------------------------------------------------------------------
    //The layer that stores anything that is currently mapped
    //----------------------------------------------------------------------------
    var layerMarkerMapped = [];

    //----------------------------------------------------------------------------
    //Load the basemap
    //----------------------------------------------------------------------------
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

    //----------------------------------------------------------------------------
    //Make markers for all organization
    //----------------------------------------------------------------------------
    var dataAllOrgs = makeMakers(organizations, mapAllOrgs);

    //----------------------------------------------------------------------------
    //All organization names
    //----------------------------------------------------------------------------
    var orgNames = getNames(organizations);
    autoComplete(orgNames);

    //----------------------------------------------------------------------------
    // Organizations are grouped by size
    //----------------------------------------------------------------------------
    var dataGroupedSizeAllOrgs = groupData(dataAllOrgs, 'size_num');
    console.log(dataGroupedSizeAllOrgs);

    //----------------------------------------------------------------------------
    // Organizations are grouped by type
    //----------------------------------------------------------------------------
    var dataGroupedTypeAllOrgs = groupData(dataAllOrgs, 'org_type');

    //----------------------------------------------------------------------------
    //On page load, plot all markers
    //----------------------------------------------------------------------------
    layerMarkerMapped = _.chain(dataAllOrgs)
                         .sortBy(function(datum){
                           return -datum.size_num;
                         })
                         .map(function(datum){
                           return datum.marker.addTo(mapAllOrgs);
                         })
                         .value();
    console.log(layerMarkerMapped)
    //----------------------------------------------------------------------------
    // When the display option switches are changed,
    // show different type or size switches.
    // When one switch is turned on,
    // the other one should be turned off automatically,
    // the turned-off switch's child switches should be turned off as well,
    // the map markers should be cleared,
    // the auto-complete should be set to empty since there is no marker
    // and the corresponding options should show.
    // When one switch is turned off manually,
    // the child switches should be hidden and switched off
    // all markers should be shown again
    // and the orgNames should be all organizations' names
    //----------------------------------------------------------------------------
    $('#tbl-switch input').on('change', function(){
      var id = this.id; // the id of the switch display option
      var status = $(this).prop('checked'); // the status of the switch display option

      if(id === 'swith-type'){
        cleanMarkers(layerMarkerMapped, mapAllOrgs);
        layerMarkerMapped = [];
        if(status === true){
          $('#tbl-org-type-switch').show();
          $('#tbl-org-size-switch').hide();
          $('#swith-size').prop('checked', false);
          orgNames = [];
          console.log(orgNames.length);
          autoComplete(orgNames);
          $('#tbl-org-size-switch input').prop('checked', false);
        }else{
          $('#tbl-org-type-switch').hide();
          layerMarkerMapped = _.chain(dataAllOrgs)
                               .sortBy(function(datum){
                                 return -datum.size_num;
                               })
                               .map(function(datum){
                                 return datum.marker.addTo(mapAllOrgs);
                               })
                               .value();
          orgNames = getNames(organizations);
          console.log(orgNames.length);
          autoComplete(orgNames);
          $('#tbl-org-type-switch input').prop('checked', false);
        }

      }else if(id === 'swith-size'){
        cleanMarkers(layerMarkerMapped, mapAllOrgs);
        layerMarkerMapped = []
        if(status === true){
          $('#tbl-org-type-switch').hide();
          $('#tbl-org-size-switch').show();
          $('#swith-type').prop('checked', false);
          orgNames = [];
          console.log(orgNames.length);
          autoComplete(orgNames);
          $('#tbl-org-type-switch input').prop('checked', false);
        }else{
          $('#tbl-org-size-switch').hide();
          layerMarkerMapped = _.chain(dataAllOrgs)
                               .sortBy(function(datum){
                                 return -datum.size_num;
                               })
                               .map(function(datum){
                                 return datum.marker.addTo(mapAllOrgs);
                               })
                               .value();
          orgNames = getNames(organizations);
          console.log(orgNames.length);
          autoComplete(orgNames);
          $('#tbl-org-size-switch input').prop('checked', false);
        }
      }
    })

    //----------------------------------------------------------------------------
    // When any type switch is on,
    // add such type markers to the map,
    // obtain names of these organizations of this type,
    // and change the auto-complte.
    // When any type switch is off,
    // clean such type markers from the map,
    // clear such names from the orgNames,
    // and change the autoComplete.
    //----------------------------------------------------------------------------
    $('#tbl-org-type-switch input').on('change', function(){
      var id = this.id;
      var status = $(this).prop('checked');

      if(status){
        switch(id){
          case 'swith-edu':
            layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedTypeAllOrgs['Education'], mapAllOrgs)), true);
            orgNames = _.union(orgNames, getNames(dataGroupedTypeAllOrgs['Education']));
            autoComplete(orgNames);
            console.log(orgNames.length);
            break;
          case 'swith-com':
            layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedTypeAllOrgs['Community'], mapAllOrgs)), true);
            orgNames = _.union(orgNames, getNames(dataGroupedTypeAllOrgs['Community']));
            autoComplete(orgNames);
            console.log(orgNames.length);
            break;
          case 'swith-per':
            layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedTypeAllOrgs['Performing Arts'], mapAllOrgs)), true);
            orgNames = _.union(orgNames, getNames(dataGroupedTypeAllOrgs['Performing Arts']));
            autoComplete(orgNames);
            console.log(orgNames.length);
            break;
          case 'swith-sup':
            layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedTypeAllOrgs['Support & Advocacy'], mapAllOrgs)), true);
            orgNames = _.union(orgNames, getNames(dataGroupedTypeAllOrgs['Support & Advocacy']));
            autoComplete(orgNames);
            console.log(orgNames.length);
            break;
          case 'swith-mus':
            layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedTypeAllOrgs['Museums, Visual Arts, History'], mapAllOrgs)), true);
            orgNames = _.union(orgNames, getNames(dataGroupedTypeAllOrgs['Museums, Visual Arts, History']));
            autoComplete(orgNames);
            console.log(orgNames.length);
            break;
          case 'swith-bro':
            layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedTypeAllOrgs['Broadcasters, Producers, TV, Film & Digital Media'], mapAllOrgs)), true);
            orgNames = _.union(orgNames, getNames(dataGroupedTypeAllOrgs['Broadcasters, Producers, TV, Film & Digital Media']));
            autoComplete(orgNames);
            console.log(orgNames.length);
            break;
          default:
            break;
        }
      }else{
        var makersToRemove = [];
        switch(id){
          case 'swith-edu':
            makersToRemove = _.filter(layerMarkerMapped, function(datum){return datum.options.fillColor === '#572285';});
            cleanMarkers(makersToRemove, mapAllOrgs);
            layerMarkerMapped = _.difference(layerMarkerMapped, makersToRemove);
            orgNames = _.difference(orgNames, getNames(dataGroupedTypeAllOrgs['Education']));
            autoComplete(orgNames);
            console.log(orgNames.length);
            break;
          case 'swith-com':
            makersToRemove = _.filter(layerMarkerMapped, function(datum){return datum.options.fillColor === '#228557';});
            cleanMarkers(makersToRemove, mapAllOrgs);
            layerMarkerMapped = _.difference(layerMarkerMapped, makersToRemove);
            orgNames = _.difference(orgNames, getNames(dataGroupedTypeAllOrgs['Community']));
            autoComplete(orgNames);
            console.log(orgNames.length);
            break;
          case 'swith-per':
            makersToRemove = _.filter(layerMarkerMapped, function(datum){return datum.options.fillColor === '#e94b6e';});
            cleanMarkers(makersToRemove, mapAllOrgs);
            layerMarkerMapped = _.difference(layerMarkerMapped, makersToRemove);
            orgNames = _.difference(orgNames, getNames(dataGroupedTypeAllOrgs['Performing Arts']));
            autoComplete(orgNames);
            console.log(orgNames.length);
            break;
          case 'swith-sup':
            makersToRemove = _.filter(layerMarkerMapped, function(datum){return datum.options.fillColor === '#ff934f';});
            cleanMarkers(makersToRemove, mapAllOrgs);
            layerMarkerMapped = _.difference(layerMarkerMapped, makersToRemove);
            orgNames = _.difference(orgNames, getNames(dataGroupedTypeAllOrgs['Support & Advocacy']));
            autoComplete(orgNames);
            console.log(orgNames.length);
            break;
          case 'swith-mus':
            makersToRemove = _.filter(layerMarkerMapped, function(datum){return datum.options.fillColor === '#2a9aec';});
            cleanMarkers(makersToRemove, mapAllOrgs);
            layerMarkerMapped = _.difference(layerMarkerMapped, makersToRemove);
            orgNames = _.difference(orgNames, getNames(dataGroupedTypeAllOrgs['Museums, Visual Arts, History']));
            autoComplete(orgNames);
            console.log(orgNames.length);
            break;
          case 'swith-bro':
            makersToRemove = _.filter(layerMarkerMapped, function(datum){return datum.options.fillColor === '#ffc100';});
            cleanMarkers(makersToRemove, mapAllOrgs);
            layerMarkerMapped = _.difference(layerMarkerMapped, makersToRemove);
            orgNames = _.difference(orgNames, getNames(dataGroupedTypeAllOrgs['Broadcasters, Producers, TV, Film & Digital Media']));
            autoComplete(orgNames);
            console.log(orgNames.length);
            break;
          default:
            break;
        }
      }
    });

    //----------------------------------------------------------------------------
    // When any size switch is on,
    // add such size markers to the map,
    // obtain names of these organizations of this size,
    // and change the auto-complte.
    // When any size switch is off,
    // clean such size markers from the map,
    // clear such names from the orgNames,
    // and change the autoComplete.
    //----------------------------------------------------------------------------
    $('#tbl-org-size-switch input').on('change', function(){
      var id = this.id;
      var status = $(this).prop('checked');

      console.log(id, status)

      if(status){
        switch(id){
          case 'swith-vs':
            layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedSizeAllOrgs['5'], mapAllOrgs)), true);
            orgNames = _.union(orgNames, getNames(dataGroupedSizeAllOrgs['5']));
            autoComplete(orgNames);
            console.log(orgNames.length);
            break;
          case 'swith-sm':
            layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedSizeAllOrgs['10'], mapAllOrgs)), true);
            orgNames = _.union(orgNames, getNames(dataGroupedSizeAllOrgs['10']));
            autoComplete(orgNames);
            console.log(orgNames.length);
            break;
          case 'swith-m':
            layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedSizeAllOrgs['15'], mapAllOrgs)), true);
            orgNames = _.union(orgNames, getNames(dataGroupedSizeAllOrgs['15']));
            autoComplete(orgNames);
            console.log(orgNames.length);
            break;
          case 'swith-l':
            layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedSizeAllOrgs['20'], mapAllOrgs)), true);
            orgNames = _.union(orgNames, getNames(dataGroupedSizeAllOrgs['20']));
            autoComplete(orgNames);
            console.log(orgNames.length);
            break;
          case 'swith-vl':
            layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedSizeAllOrgs['25'], mapAllOrgs)), true);
            orgNames = _.union(orgNames, getNames(dataGroupedSizeAllOrgs['25']));
            autoComplete(orgNames);
            console.log(orgNames.length);
            break;
          default:
            break;
        }
      }else{
        var makersToRemove = [];
        switch(id){
          case 'swith-vs':
            makersToRemove = _.filter(layerMarkerMapped, function(datum){return datum.options.radius === 5;});
            cleanMarkers(makersToRemove, mapAllOrgs);
            layerMarkerMapped = _.difference(layerMarkerMapped, makersToRemove);
            orgNames = _.difference(orgNames, getNames(dataGroupedSizeAllOrgs['5']));
            autoComplete(orgNames);
            console.log(orgNames.length);
            break;
          case 'swith-sm':
            makersToRemove = _.filter(layerMarkerMapped, function(datum){return datum.options.radius === 10;});
            cleanMarkers(makersToRemove, mapAllOrgs);
            layerMarkerMapped = _.difference(layerMarkerMapped, makersToRemove);
            orgNames = _.difference(orgNames, getNames(dataGroupedSizeAllOrgs['10']));
            autoComplete(orgNames);
            console.log(orgNames.length);
            break;
          case 'swith-m':
            makersToRemove = _.filter(layerMarkerMapped, function(datum){return datum.options.radius === 15;});
            cleanMarkers(makersToRemove, mapAllOrgs);
            layerMarkerMapped = _.difference(layerMarkerMapped, makersToRemove);
            orgNames = _.difference(orgNames, getNames(dataGroupedSizeAllOrgs['15']));
            autoComplete(orgNames);
            console.log(orgNames.length);
            break;
          case 'swith-l':
            makersToRemove = _.filter(layerMarkerMapped, function(datum){return datum.options.radius === 20;});
            cleanMarkers(makersToRemove, mapAllOrgs);
            layerMarkerMapped = _.difference(layerMarkerMapped, makersToRemove);
            orgNames = _.difference(orgNames, getNames(dataGroupedSizeAllOrgs['20']));
            autoComplete(orgNames);
            console.log(orgNames.length);
            break;
          case 'swith-vl':
            makersToRemove = _.filter(layerMarkerMapped, function(datum){return datum.options.radius === 25;});
            cleanMarkers(makersToRemove, mapAllOrgs);
            layerMarkerMapped = _.difference(layerMarkerMapped, makersToRemove);
            orgNames = _.difference(orgNames, getNames(dataGroupedSizeAllOrgs['25']));
            autoComplete(orgNames);
            console.log(orgNames.length);
            break;
          default:
            break;
      }
    }
  });





    //Marker layers for all organizations and the searched organization
    var layerAllOrgs = [],
        layerVerySmallOrgs = [],
        layerSmallOrgs = [],
        layerMediumOrgs = [],
        layerLargeOrgs = [],
        layerVeryLargeOrgs = [],
        layerSearchedOrg = [],
        layerEduOrgs = [],
        layerComOrgs = [],
        layerPerOrgs = [],
        layerSupOrgs = [],
        layerMusOrgs = [],
        layerBroOrgs = [];









    // layerVeryLargeOrgs = plotMarkers(dataGroupedSizeAllOrgs['25'], mapAllOrgs);
    // layerLargeOrgs = plotMarkers(dataGroupedSizeAllOrgs['20'], mapAllOrgs);
    // layerMediumOrgs = plotMarkers(dataGroupedSizeAllOrgs['15'], mapAllOrgs);
    // layerSmallOrgs = plotMarkers(dataGroupedSizeAllOrgs['10'], mapAllOrgs);
    // layerVerySmallOrgs = plotMarkers(dataGroupedSizeAllOrgs['5'], mapAllOrgs);



    //-------------------------------------
    //The search button function
    //-------------------------------------
    // $('#btn-org-search').on('click',function(){
    //   //Get the input organization name
    //   var inputOrgName = $( "#searchbox-org-name" ).val();
    //
    //   //clear the all organizations and the searched organization marker layer
    //   cleanMarkers(layerAllOrgs, mapAllOrgs);
    //   cleanMarkers(layerSearchedOrg, mapAllOrgs);
    //   cleanMarkers(layerVerySmallOrgs, mapAllOrgs);
    //   cleanMarkers(layerSmallOrgs, mapAllOrgs);
    //   cleanMarkers(layerMediumOrgs, mapAllOrgs);
    //   cleanMarkers(layerLargeOrgs, mapAllOrgs);
    //   cleanMarkers(layerVeryLargeOrgs, mapAllOrgs);
    //   layerAllOrgs = [];
    //   layerSearchedOrg = [];
    //   layerVerySmallOrgs = [];
    //   layerSmallOrgs = [];
    //   layerMediumOrgs = [];
    //   layerLargeOrgs = [];
    //   layerVeryLargeOrgs = [];
    //
    //   //clear the organization information table on the sidebar
    //   $('#tbl-org-searched').empty();
    //   //Get the searched organization ID based on name matched with the all organization data
    //   var searchedOrgID = _.chain(organizations)
    //                       .filter(function(org){
    //                         return org.name == inputOrgName;
    //                       })
    //                       .pluck('id')
    //                       .first()
    //                       .value();
    //
    //   //add the searched organization marker layer to the map
    //   layerSearchedOrg = _.chain(organizations)
    //                       .filter(function(org){
    //                         return org.id == searchedOrgID;
    //                       })
    //                       .map(function(org){
    //                         mapAllOrgs.setView([org.latitude, org.longitude], 11)
    //                         return org.marker.addTo(mapAllOrgs);
    //                       })
    //                       .value()
    //   //Look for the hidden organization table row with the searched organization ID
    //   //Clone it and append it to the organization information table on the sidebar
    //   //It has the link to take the user to the individual organization page
    //   $("#tbl-allorg #row-"+searchedOrgID).clone().appendTo('#tbl-org-searched');
    // })

    //Add back all organizations to the map
    // $('#btn-org-clear').on('click',function(){
    //   //Clear the organization information table from the sidebar
    //   $('#tbl-org-searched').empty();
    //   //Clear the searched organization layer from the map
    //   cleanMarkers(layerAllOrgs, mapAllOrgs);
    //   cleanMarkers(layerSearchedOrg, mapAllOrgs);
    //   cleanMarkers(layerVerySmallOrgs, mapAllOrgs);
    //   cleanMarkers(layerSmallOrgs, mapAllOrgs);
    //   cleanMarkers(layerMediumOrgs, mapAllOrgs);
    //   cleanMarkers(layerLargeOrgs, mapAllOrgs);
    //   cleanMarkers(layerVeryLargeOrgs, mapAllOrgs);
    //   layerAllOrgs = [];
    //   layerSearchedOrg = [];
    //   layerVerySmallOrgs = [];
    //   layerSmallOrgs = [];
    //   layerMediumOrgs = [];
    //   layerLargeOrgs = [];
    //   layerVeryLargeOrgs = [];
    //   //Clear the search box input
    //   $('#searchbox-org-name').val('');
    //   //Add back all organizations to the map
    //   layerVeryLargeOrgs = plotMarkers(dataGroupedSizeAllOrgs['25'], mapAllOrgs);
    //   layerLargeOrgs = plotMarkers(dataGroupedSizeAllOrgs['20'], mapAllOrgs);
    //   layerMediumOrgs = plotMarkers(dataGroupedSizeAllOrgs['15'], mapAllOrgs);
    //   layerSmallOrgs = plotMarkers(dataGroupedSizeAllOrgs['10'], mapAllOrgs);
    //   layerVerySmallOrgs = plotMarkers(dataGroupedSizeAllOrgs['5'], mapAllOrgs);
    //   mapAllOrgs.setView([34.0522, -118.2437], 10);
    // });

    // $('#tbl-org-type-switch input').on('change', function(){
    //   var switchID = this.id;
    //   var switchStatus = $(this).prop('checked');
    //
    //   cleanMarkers(layerAllOrgs, mapAllOrgs);
    //   cleanMarkers(layerSearchedOrg, mapAllOrgs);
    //   cleanMarkers(layerVerySmallOrgs, mapAllOrgs);
    //   cleanMarkers(layerSmallOrgs, mapAllOrgs);
    //   cleanMarkers(layerMediumOrgs, mapAllOrgs);
    //   cleanMarkers(layerLargeOrgs, mapAllOrgs);
    //   cleanMarkers(layerVeryLargeOrgs, mapAllOrgs);
    //

    //   console.log(switchID, switchStatus);
    //   if(switchStatus === false){
    //     switch(switchID){
    //       case 'swith-edu':
    //     }
    //   }
    // });

  }
});
