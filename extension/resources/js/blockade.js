console.log(LZMA);
var BlockadeIO = {
    indicatorCount: 0,
    indicators: null,
    sources: [],

    init: function() {
        if (localStorage.getItem("indicators") !== null) {
            console.log("Loading signatures from storage");
            LZMA.decompress(localStorage.indicators, function(decoded, error) {
                BlockadeIO.indicators = JSON.parse(decoded);
                BlockadeIO.active = true;
            });
        }
    },

    addSource: function(data) {
        BlockadeIO.sources.push(data);
    },

    finalize: function() {
        var indicators = {};
        for (var i=0; i < BlockadeIO.sources.length; i++) {
            var data = BlockadeIO.sources[i];
            for (var j=0; j < data.indicators.length; j++) {
                var item = data.indicators[j];
                if (indicators.hasOwnProperty(item)) {
                    indicators[item].push(data.source);
                } else {
                    indicators[item] = [data.source];
                }
            }
        }
        var store = JSON.stringify(indicators);
        LZMA.compress(store, 1, function(encoded, error) {
            localStorage.indicators = encoded;
        });
        BlockadeIO.indicatorCount = Object.keys(indicators).length;
        BlockadeIO.indicators = indicators;
        BlockadeIO.active = true;
        return true;
    }

};

BlockadeIO.init();

// console.log(BlockadeIO);
// $.ajax({
//     url: localStorage.cfg_cloudUrl + 'get-indicators',
//     type: 'get',
//     success: function(data) {
//         if (!data.success) {
//             return false;
//         }
//         BlockadeIO.addSource(data);
//         console.log(BlockadeIO.finalize());
//     }
// });