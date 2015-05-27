function bind(router){
	var stdin = process.stdin 
	stdin.setRawMode(true )
	stdin.resume()
	stdin.setEncoding( 'utf8' )


	var history = []
		,history_nu = 0
		,column_nu = null
	var userInput = ''
	function echo(str){
		process.stdout.write(str)
	}

	function execInput(){
		var _input = userInput.trim()

		var last_history = history.slice(-1)
		if (!last_history[0] || _input != last_history[0]){
			history.push(_input)
		}
		history_nu = history.length
		router(_input)
		userInput = ''
		_lastInput = null
		column_nu = null
	}
	var _lastInput
	function historyEcho(){
		if (!_lastInput) _lastInput = userInput
		if (history_nu < 0 ) history_nu = 0
		if (history_nu > history.length) history_nu = history.length
		var _input = history[history_nu]
		userInput = _input || _lastInput
		column_nu = null
		process.stdout.clearLine()
		process.stdout.cursorTo(0)
		echo(userInput)
	}

	function chgEcho(){
		if (null === column_nu) column_nu = userInput.length - 1
		else if (column_nu < 0 ) column_nu = 0
		else if (column_nu > userInput.length) column_nu = userInput.length
		process.stdout.cursorTo(column_nu)
	}

	stdin.on("data", function(input) {
		var ascii = input.charCodeAt(0)
		switch (ascii) {
			case 127:
				process.stdout.clearLine()
				process.stdout.cursorTo(0)
				if (null === column_nu){
					userInput = userInput.slice(0 , -1)
				}else {
					userInput = userInput.slice(0, column_nu -1) + userInput.slice(column_nu)
					column_nu--
				}
				echo(userInput)
				if (null !== column_nu){
					chgEcho()
				}
				_lastInput = null
				return
			case 13:
				echo('\n')
				execInput()
				return
			case 3:
				print('Cancelled')
				process.exit()
				return
		}

		switch (input) {
			case '\u001b[A':
				history_nu--
				historyEcho()
				break
			case '\u001b[B':
				history_nu++
				historyEcho()
				break
			case '\u001b[D':
				if (null !== column_nu) column_nu--
				chgEcho()
				break
			case '\u001b[C':
				//上下左右
				if (null !== column_nu) column_nu++
				chgEcho()
				break
			default:
				if (null === column_nu){
					userInput += input
					echo(input)
				}else {
					userInput = userInput.slice(0, column_nu) + input + userInput.slice(column_nu)
					column_nu++
					process.stdout.clearLine()
					process.stdout.cursorTo(0)
					echo (userInput)
					chgEcho()
				}
				_lastInput = null
				break
		}
	})

}
exports.bind = bind 
