#!./scm -1

(define (die message)
    (begin (display "ERROR: ") (display message) (newline) (quit)))

(define (help-text)
    (string-append "Cephon's FUCKING EPIC build system that does NOT suck.\n\n"
                   "Commands:\n"
                   "    all           - runs all the scripts that produce something (gallery and museum)\n"
                   "    gallery       - builds the gallery\n"
                   "    serve         - serve the website on localhost\n"
                   "    museum        - builds the museum\n"
                   "    rename-emoji  - rename a museum emoji. rename-emoji thing.gif thing2.gif. no need to include the full path\n"
                   "    help          - prints this\n"
                   ))

(if (null? *args*)
    (die (string-append "Pass at least one arguemnt, pretty please <3\n\n" (help-text))))

(define (build-gallery)
    (if (not (= (cmd "python3" "./scripts/gallery_make.py") 0))
        (die "Failed to build gallery")))

(define (build-museum)
    (if (not (= (cmd "python3" "./scripts/museum_make.py") 0))
        (die "Failed to build museum")))

(define (serve-site)
    (cmd "python3" "-m" "http.server" "--directory" "./site")
    (quit))


(define (text-to-build-command text other-args)
    (cond
        ((equal? text "gallery") (build-gallery))
        ((equal? text "museum" ) (build-museum))
        ((equal? text "serve"  ) (serve-site))
        ((equal? text "help"   )
            (begin (display (help-text)) (quit)))
        ((equal? text "rename-emoji")
            (begin
                (if (not (= (cmd "mv" (string-append "site/museum/pengers/" (car other-args)) (string-append "site/museum/pengers/" (cadr other-args))) 0)) (die "Failed to rename emoji"))
                (if (not (= (cmd "fossil" "rm" (string-append "site/museum/pengers/" (car other-args))) 0)) (die "Failed to untrack emoji using fossil"))
                (if (not (= (cmd "fossil" "add" (string-append "site/museum/pengers/" (cadr other-args))) 0)) (die "Failed to track new emoji using fossil"))
                (display "Emoji renamed! please do not forget to rebuild the museum with `./build.scm museum`!") (newline)
                (quit)))
        ((equal? text "all"    )
            (begin
                (build-gallery)
                (build-museum)
                (quit)))
        (#t (die (string-append "Unknown command " text)) )))

(define (handle-arguments args)
    (if (not (null? args))
        (begin (text-to-build-command (car args) (cdr args)) (handle-arguments (cdr args)))))

(handle-arguments *args*)
