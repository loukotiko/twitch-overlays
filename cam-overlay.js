let options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: 'tikoati',
        password: 'oauth:kts2ljaxt74zhxjnq7pfh9lsauw3yp'
    },
    channels: ['#loukotiko']
}

let client = new tmi.client(options)

client.connect()

client.on('message', (channel, userstate, message, self) => {
    if (self || !message) return

    ['instagram', 'wattpad', 'discord'].forEach(id => message.startsWith('!' + id) && CamOverlay.activate(id))

    // Moderator commands
    if (userstate.mod) {
        message.startsWith('!mute') && CamOverlay.toggleMute();
    }
})

window.CamOverlay = new function () {
    let state = {
        timeouts: {},
        muted: false
    }

    let elements = {
        input: id => document.getElementById(id),

        hour: document.querySelector('.hour'),
        date: document.querySelector('.date')
    }

    this.activate = id => {
        if (state.timeouts[id]) clearTimeout(state.timeouts[id])

        let input = elements.input(id)
        input.checked = true
        state.timeouts[id] = setTimeout(_ => input.checked = false, 10000)

        let label = document.querySelector(`label[for=${id}]`)
        let tooltip = label.querySelector('.tooltip')
        client.say(options.channels[0], tooltip.innerText)
    }

    this.toggleMute = () => {
        state.muted = !state.muted
        elements.input('mic').checked = state.muted
    }

    let addZero = n => n < 10 ? '0' + n : n;

    displayDate = () => {
        let now = new Date();
        elements.hour.innerHTML = addZero(now.getHours()) + ':' + addZero(now.getMinutes());
        elements.date.innerHTML = addZero(now.getDate()) + '/' + addZero(now.getMonth() + 1) + '/' + now.getFullYear();
    }

    setTimeout(displayDate, 1000)
}