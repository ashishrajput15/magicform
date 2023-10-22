(function() {
  console.log('after.js executed');

  const forms = document.querySelectorAll('form');

  if (forms.length > 0) {
    forms.forEach((form) => {
      const submitButtons = form.querySelectorAll('input[type="submit"], button[type="submit"]');
      
      if (submitButtons.length > 0) {
        const firstSubmitButton = submitButtons[0];        

        const magicButton = document.createElement("button");
        magicButton.innerText = "Magic Form";
        magicButton.style.marginLeft = "12px";
        magicButton.addEventListener("click", async () => {
          await generateData();
          console.log("Ready to Submit");
        });

        // submitButtons.forEach((submitButton) => {
        //   submitButton.insertAdjacentElement('afterend', magicButton.cloneNode(true));
        // });

        firstSubmitButton.insertAdjacentElement('afterend', magicButton.cloneNode(true));
      }
    });
  }
  
})();
