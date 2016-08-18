;(function(){    
    if(typeof $ === 'undefined'){
        console.log("It need jquery!")
        return;
    }

    var Router = function(){
        var self = this;
        this.hashMode = '#/';
        this.hasInit = false;
        this.isClick = false;

        this.init = function(){
            this.createEvent();
            this.getState();
        }
        this.createEvent = function(){
            var parms = {
                oldUrl: '',
                oldState: '',
                newUrl: '',
                newState: ''
            }
            var routerEvent = new CustomEvent('routerChanged', {
                'detail': parms
            });
            window.addEventListener('hashchange', function(e){
                parms.oldUrl = e.oldURL || '';
                parms.oldState = e.oldURL.split(self.hashMode)[1] || '';
                parms.newUrl = e.newURL || '';
                parms.newState = e.newURL.split(self.hashMode)[1] || '';
                window.dispatchEvent(routerEvent);

                var currState = window.location.href.split(self.hashMode)[1];
                if(!self.isClick){
                    self.go(currState);
                }
            })
        }
        this.setHashMode = function(value){
            this.hashMode = value + '/';
            this.init();
        }
        this.on = function(event, cb){
            window.addEventListener(event, function(e){
                var currState = window.location.href.split(self.hashMode)[1];
                var parms = e.detail;
                if(currState in self.allState){
                    cb(e, parms);
                }
            });
        }
        this.allState = {};
        this.config = function(configState){
            configState(this);
            for(var key in this.allState){
                this.initView(key);
                return;
            }
        }
        this.getState = function(){
            var $stateDom = $('a[state]');
            $stateDom
                .on('click', function(e){
                    self.isClick = true;
                    var state = $(e.target).attr('state');
                    var currState = window.location.href.split(self.hashMode)[1];
                    if(currState == state) return;
                    self.go(state);
                    return false;
                })
                .map(function(index, value){
                    var state = $(value).attr('state');
                    if(state in self.allState) return;
                    self.allState[state] = {};
                })
        }
        this.when = function(state, tplObj){
            self.allState[state] = tplObj;
            return self;
        }
        this.initView = function(initState){
            var state;
            var currState = window.location.href.split(self.hashMode)[1];
            if(currState && currState != 'undefined'){
                state = currState
                this.go(state);
            }else{
                state = initState;
            }

            this.setUrl(state);
        }
        this.go = function(state){
            var allState = this.allState;
            var $viewDom = $('RouterView');
            if( !(state in allState) ){
                this.isClick = false;
                this.other();
                return;
            }

            var cb = allState[state].cb || (function(state){});
            if(allState[state].templateUrl){
                $viewDom.load(allState[state].templateUrl, function(){
                    cb(state);
                });
            }else{
                $viewDom.html(allState[state].template);
                cb(state);
            }
            //change url, trigger onhashchange event
            this.setUrl(state);
            this.getState();
        }
        this.setUrl = function(state){
            var path = window.location.pathname;
            var url = path + this.hashMode + state;
            window.location.href = url;
        }
        this.other = function(state){
            self.other = function(){
                self.go(state);
            }
        }
        this.init();
    }
    if(typeof window.Router === 'undefined'){
        window.router = new Router();
    }
})();


