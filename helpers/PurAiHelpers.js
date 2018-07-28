module.exports = {
    formatPhoneNumber: function (phone) {
        phone = phone.replace(/\D/g,"");
        phone = phone.replace(/^(\d{2})(\d)/g,"($1) $2");
        phone = phone.replace(/(\d)(\d{4})$/,"$1-$2");
        return phone;
    },

    validateEmail: function (email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
};