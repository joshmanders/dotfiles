((text) @injection.content
  (#set! injection.combined)
  (#set! injection.language "html"))

((php_only) @injection.content
  (#set! injection.language "php"))

((parameter) @injection.content
  (#set! injection.language "php"))
