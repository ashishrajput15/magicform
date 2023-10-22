(function() {
  console.log('after.js executed');
    const submitButtons = document.querySelectorAll('input[type="submit"], button[type="submit"]');
    
    console.log(submitButtons);
    if (submitButtons.length > 0) {
      const magicButton = document.createElement("button");
      magicButton.innerText = "Magic Form";

      magicButton.addEventListener("click", async () => {
        await generateFormData();
        console.log("Ready to Submit");
      });
      
      submitButtons.forEach((submitButton) => {
        submitButton.insertAdjacentElement('afterend', magicButton);
      });
    }
  
})();
