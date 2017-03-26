//localStorage
var placeInfo = [{
    name: '澳洲牛奶公司',
    wikiName: 'Australia Dairy Company',
    id: 'place0',
    lat: 22.30459,
    lng: 114.170516,
    filter: 0,
    srNum: 0
}, {
    name: '华星冰室',
    wikiName: 'Capital Cafe',
    id: 'place1',
    lat: 22.277719,
    lng: 114.177189,
    filter: 0,
    srNum: 1
}, {
    name: '九记牛腩',
    wikiName: 'Kau Kee Restaurant',
    id: 'place2',
    lat: 22.28422,
    lng: 114.15251,
    filter: 0,
    srNum: 2
}, {
    name: '翠华餐厅',
    wikiName: 'Tsui Wah Restaurant',
    id: 'place3',
    lat: 22.28172,
    lng: 114.155734,
    filter: 0,
    srNum: 3
}, {
    name: '利苑酒家',
    wikiName: 'Lei Garden',
    id: 'place4',
    lat: 22.320259,
    lng: 114.17139,
    filter: 1,
    srNum: 4
}, {
    name: '唐閣',
    wikiName: 'Tang Court',
    id: 'place5',
    lat: 22.296439,
    lng: 114.169776,
    filter: 1,
    srNum: 5
}, {
    name: '新斗记',
    wikiName: 'Xin Dau Ji',
    id: 'place6',
    lat: 22.306663,
    lng: 114.172078,
    filter: 1,
    srNum: 6
}];

//
var Place = function(data) {
    this.placeName = ko.observable(data.name);
    this.wikiPlace = ko.observable(data.wikiName);
    this.placeId = ko.observable(data.id);
    this.divId = ko.computed(function() {
        var div = 'div' + this.placeId();
        return div;
    }, this);
    this.filter = ko.observable(data.filter);
    this.srNum = ko.observable(data.srNum);
    this.details = ko.observableArray([]);
    this.sourceWiki = ko.observable(true);
    this.wiki = ko.computed(function() {
        var self = this;
        var name = this.wikiPlace();
        var wiki = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + name + '&prop=revisions&rvprop=content&format=json';

        //Error for Wikipedia
        var wikiTimeout = setTimeout(function() {
            self.details.push("Oops! Failed to connect to Wikipedia");
            var alerted = localStorage.getItem('alerted') || '';
            if (alerted != 'yes') {
                alert("Unable to connect to Wikipedia");
                localStorage.setItem('alerted', 'yes');
            }
            self.sourceWiki(false);
        }, 8000);
        $.ajax({
            url: wiki,
            dataType: 'jsonp',
        }).done(function(response) {
            var wikiArticles = response[2];
            wikiDetails = wikiArticles[0];
            self.details.push(wikiDetails);
            clearTimeout(wikiTimeout);
        });
    }, this);

    this.wikiDesc = ko.observable('');
    this.listVisible = ko.observable(true);
    this.wikiVisible = ko.observable(false);
};

var myViewModel = function() {
    var self = this;
    localStorage.removeItem('alerted');
    this.placeList = ko.observableArray([]);
    placeInfo.forEach(function(place) {
        self.placeList.push(new Place(place));
    });
    this.filterIndicator = ko.observable('');
    this.filterInfo = ko.observable(false);
    this.displayFilter = ko.observable('dropdown-content');

    //Display the drop down menu.
    var flag;
    this.showDropDown = function() {
        if (flag !== 0) {
            self.displayFilter('dropdown-content' + ' ' + 'show');
            flag = 0;
        } else {
            self.displayFilter('dropdown-content');
            flag = 1;
        }
    };


    var temp;
    this.listClass = ko.observable('');
    this.mapWidth = ko.observable('');
    this.showList = function() {
        if (temp !== 0) {
            self.listClass('listClass');
            self.mapWidth('50%');
            temp = 0;
        } else {
            self.listClass('');
            self.mapWidth('100%');
            temp = 1;
        }
    };

    //Display cheap places.
    this.filterListCheap = function() {
        var len = self.placeList().length;
        self.filterIndicator('Cheap Places:');
        self.filterInfo(true);
        for (var i = 0; i < len; i++) {
            if (self.placeList()[i].filter() === 1) {
                self.placeList()[i].listVisible(true);
                cheapPlaceMarker();
            } else {
                self.placeList()[i].listVisible(false);
            }
            self.placeList()[i].wikiVisible(false);
        }
    };

    //Display costly places.
    this.filterListCostly = function() {
        var len = self.placeList().length;
        self.filterIndicator('Costly Places:');
        self.filterInfo(true);
        for (var i = 0; i < len; i++) {
            if (self.placeList()[i].filter() === 0) {
                self.placeList()[i].listVisible(true);
                costlyPlaceMarker();
            } else {
                self.placeList()[i].listVisible(false);
            }
            self.placeList()[i].wikiVisible(false);
        }
    };

    //Display all places.
    this.filterListAll = function() {
        var len = self.placeList().length;
        self.filterIndicator('All places:');
        self.filterInfo(true);
        for (var i = 0; i < len; i++) {
            self.placeList()[i].listVisible(true);
            self.placeList()[i].wikiVisible(false);
            allPlaceMarker();
        }
    };

    //Show the decription from Wikipedia.
    this.displayDetails = function(thisPlace) {
        self.displayWikiDetails(this);
        clickList(this.srNum());
    };

    markerDisplayDetails = function(thisId) {
        self.placeList().forEach(function(place) {
            if (thisId === place.srNum()) {
                self.displayWikiDetails(place);
            }
        });
    };

    this.displayWikiDetails = function(thisPlace) {
        thisPlace.wikiDesc(thisPlace.details()[0]);
        self.placeList().forEach(function(list) {
            list.wikiVisible(false);
        });
        thisPlace.wikiVisible(!thisPlace.wikiVisible());
    };
};

ko.applyBindings(new myViewModel());
