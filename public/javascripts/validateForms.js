        // Example starter JavaScript for disabling form submissions if there are invalid fields
        (() => {
            'use strict'
            // initializing bs-custom-file-input script to use in our forms for custom file inputs
            bsCustomFileInput.init()
        
            // Fetch all the forms we want to apply custom Bootstrap validation styles to
            const forms = document.querySelectorAll('.validated-form')
        
            //Make an array from this thing called forms which contain all forms that need to be validated
            Array.from(forms)
            // Loop over them and prevent submission
            .forEach(form => {
                form.addEventListener('submit', event => {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }
        
                form.classList.add('was-validated')
                }, false)
            })
            })()
        