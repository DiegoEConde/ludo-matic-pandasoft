exports.enterGame = async page => {
  const modal = page.locator('#names-modal');
  if (!await modal.evaluate(e=>e.open)) await page.locator('#start-button').click();
  if (await modal.evaluate(e=>e.open)) {
    for (const [color,name] of [['blue','Eri'],['red','Melina'],['yellow','Diego'],['green','Gustavo']]) {
      const input=page.locator('#name-'+color);
      if(await input.isVisible() && !await input.inputValue()) await input.fill(name);
    }
    await page.keyboard.press('Tab');
    await page.locator('#confirm-names-button').click();
  }
};
