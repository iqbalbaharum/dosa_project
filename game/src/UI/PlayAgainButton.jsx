function button(text = 'Play Again') {
	return (
		<button class="button is-success is-large"
			style="width: 300px"
		>
			<span style="font-family: 'Fredoka One'; font-size: 1em">
				{ text }
			</span>
		</button>
	)
}

export default button
