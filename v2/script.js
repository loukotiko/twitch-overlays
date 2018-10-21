moment.locale('fr')

let queue = []
let q = fn => (...args) => {
    queue.push({fn, args})
    if(queue.length == 1) fn(...args)
}
let uq = () => {
    queue.pop()
    let next = queue[queue.length-1]
    if(next) next.fn(...next.args)
}

window.CamOverlay = new function () {
    CamOverlay = this

    let state = {
        timeouts: {},
        muted: false
    }

    let elements = {
        pops: id => document.querySelector('[' + id + ']'),

        hour: document.querySelector('[hour]'),
        date: document.querySelector('[date]')
    }
    CamOverlay.displayFollow = q(({from_name}) => {
        var pop = elements.pops('follow');
        pop.querySelector('t').innerHTML = from_name;
        CamOverlay.display('follow')
    })

    CamOverlay.displaySubscribe = q((channel, username, method, message, userstate) => {
        var pop = elements.pops('subscribe');
        pop.querySelector('t').innerHTML = username;
        pop.querySelector('b').innerHTML = message;
        CamOverlay.display('subscribe')
    })

    CamOverlay.displayResub = q((channel, username, months, message, userstate, methods) => {
        uq()

    })

    CamOverlay.displayHosted = q((channel, username, viewers, autohost) => {
        uq()

    })

    CamOverlay.displayRaid = q((channel, raider, viewers, userstate) => {
        uq()

    })

    CamOverlay.displaySubgift = q((channel, username, recipient, method, userstate) => {
        uq()
    })

    CamOverlay.displayCustom = q(id => {
        let pop = elements.pops(id)

        CamOverlay.display(id)
        client.say(options.channels[0], pop.innerText)
    })

    CamOverlay.display = id => {
        if (state.timeouts[id]) clearTimeout(state.timeouts[id])

        let pop = elements.pops(id)

        pop.classList.add('active');
        state.timeouts[id] = setTimeout(_ => {
            pop.classList.remove('active')
            setTimeout(uq, 500)
        }, 7500)
    }

    displayDate = () => {
        let now = moment();
        elements.hour.innerHTML = now.format('LT');
        elements.date.innerHTML = now.format('dddd DD/MM');
    }

    setTimeout(displayDate, 1000)
}

let options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: 'loukotiko',
        password: 'oauth:f0cfu3t7juvuu80pqn2y0d75fdirzu'
    },
    channels: ['#loukotiko']
}

let client = new TwitchJS.client(options)

client.connect()

client.on('message', (channel, userstate, message, self) => {
    console.log({channel, userstate, message, self});
    if (self || !message) return

    ['instagram', 'wattpad', 'discord'].forEach(id => !!message.startsWith('!' + id) && CamOverlay.displayCustom(id))
})

client.on('subscription', CamOverlay.displaySubscribe)
client.on('resub', CamOverlay.displayResub)
client.on('hosted', CamOverlay.displayHosted)
client.on('raid', CamOverlay.displayRaid)
client.on('subgift', CamOverlay.displaySubgift)

let followersInterval = 60000
let getFollowers = () => 
    fetch('https://api.twitch.tv/helix/users/follows?first=5&to_id=144500698', { method: 'GET', headers: { 'Client-ID': 'me2mzqx8g5numgcs34w6sslxhpunwo' } })
    .then(response => response.json())
    .then(response => response.data)
    .then(lastFollowers => lastFollowers
        .filter(follow => moment(follow.followed_at).isAfter(moment().subtract(followersInterval)))
        .forEach(follow => CamOverlay.displayFollow(follow))
    )

setInterval(getFollowers, followersInterval)

let randomInterval = 15*60000
setInterval(() => {
    let randomPops = ['instagram', 'discord']
    CamOverlay.displayCustom(randomPops[Math.floor(randomPops.length * Math.random())])
}, randomInterval)

// Debug
window.addEventListener('keypress', event => {
    if(event.keyCode == 97) CamOverlay.displayCustom('instagram')
    if(event.keyCode == 122) CamOverlay.displayCustom('discord')
    if(event.keyCode == 101) CamOverlay.displayCustom('wattpad')
    if(event.keyCode == 114) CamOverlay.displaySubscribe('???', 'Akatpat', '???', 'Trop bien la vie avec vous, on se fait kiffer notre vie !', '???')
    if(event.keyCode == 116) CamOverlay.displayResub()
    if(event.keyCode == 121) CamOverlay.displayHosted()
    if(event.keyCode == 117) CamOverlay.displayRaid()
    if(event.keyCode == 105) CamOverlay.displaySubgift()
    if(event.keyCode == 111) CamOverlay.displayFollow({from_name: 'Tikoati'})
    // 112
})