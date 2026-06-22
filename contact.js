// Contact Form Validation and Fake Form Submission
document.addEventListener('DOMContentLoaded', () => {
    initContactForm();
});

function initContactForm() {
    const form = document.getElementById('contact-form');
    const statusBox = document.getElementById('form-status');

    if (!form || !statusBox) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const service = document.getElementById('service').value;
        const message = document.getElementById('message').value.trim();
        const submitBtn = form.querySelector('button[type="submit"]');

        // Simple validation
        if (!name || !email || !message) {
            showStatus('Please fill in all required fields (Name, Email, and Message).', 'error');
            return;
        }

        // Email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showStatus('Please enter a valid email address.', 'error');
            return;
        }

        // Service validation
        if (!service) {
            showStatus('Please select a service from the dropdown.', 'error');
            return;
        }

        // Simulate API call
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending inquiry...';
        }

        setTimeout(() => {
            // Success response
            showStatus('Thank you for contacting SoluNex Tech! We have received your inquiry and will get back to you within 24 hours.', 'success');
            form.reset();

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Send Inquiry';
            }
        }, 1500);
    });

    function showStatus(message, type) {
        statusBox.textContent = message;
        statusBox.className = 'form-status'; // Reset classes
        
        if (type === 'success') {
            statusBox.classList.add('success');
        } else if (type === 'error') {
            statusBox.classList.add('error');
        }

        // Scroll to status box on mobile
        statusBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}
