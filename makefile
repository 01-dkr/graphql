start: build
	cd app/ && php -S localhost:8080

build: clean-terminal
	sass app/style.scss app/style/style.css

clean-terminal:
	clear
