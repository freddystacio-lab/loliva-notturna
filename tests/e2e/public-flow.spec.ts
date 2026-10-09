import {expect,test,type Page} from "@playwright/test";

function watchRuntimeErrors(page:Page){
  const consoleErrors:string[]=[];const failedRequests:string[]=[];
  page.on("console",(message)=>{if(message.type()==="error")consoleErrors.push(message.text());});
  page.on("requestfailed",(request)=>{
    const reason=request.failure()?.errorText;
    if(reason!=="net::ERR_ABORTED") failedRequests.push(`${request.method()} ${request.url()} (${reason ?? "unknown"})`);
  });
  return {consoleErrors,failedRequests};
}

test("selects a language and renders the public home",async({page})=>{
  const runtime=watchRuntimeErrors(page);await page.addInitScript(()=>localStorage.clear());
  await page.goto("/");
  await expect(page.getByRole("heading",{name:"Scegli la tua lingua"})).toBeVisible();
  await page.getByRole("button",{name:/English/}).click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByRole("heading",{level:1})).toContainText("Italian night");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  expect(runtime.consoleErrors).toEqual([]);expect(runtime.failedRequests).toEqual([]);
});

test("renders menu, privacy and clearly fictional admin data",async({page,isMobile})=>{
  const runtime=watchRuntimeErrors(page);
  await page.goto("/es/menu");
  await expect(page.getByRole("heading",{name:/Hecho a mano/})).toBeVisible();
  await expect(page.getByRole("link",{name:/Descargar PDF/})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  if(isMobile){await page.getByRole("button",{name:"Open menu"}).click();await expect(page.getByRole("link",{name:"Privacidad"})).toBeVisible();}
  await page.goto("/admin/demo");
  await expect(page.getByText(/datos ficticios/)).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  expect(runtime.consoleErrors).toEqual([]);expect(runtime.failedRequests).toEqual([]);
});

test("uses the refined language listbox instead of a native select",async({page,isMobile})=>{
  const runtime=watchRuntimeErrors(page);
  await page.goto("/es/menu");
  if(isMobile) await page.getByRole("button",{name:"Open menu"}).click();
  const language=page.getByRole("button",{name:/Cambiar idioma/}).last();
  await language.click();
  await expect(page.getByRole("listbox",{name:/Cambiar idioma/})).toBeVisible();
  await page.getByRole("option",{name:/IT/}).click();
  await expect(page).toHaveURL(/\/it\/menu$/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  expect(runtime.consoleErrors).toEqual([]);expect(runtime.failedRequests).toEqual([]);
});

test("renders a real editorial image on the story page",async({page})=>{
  const runtime=watchRuntimeErrors(page);
  await page.goto("/es/story");
  const editorialImage=page.getByRole("img",{name:/Una casa italiana/i});
  await expect(editorialImage).toBeVisible();
  await expect(editorialImage.locator("img")).toHaveAttribute("src",/hero-dining-room/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  expect(runtime.consoleErrors).toEqual([]);expect(runtime.failedRequests).toEqual([]);
});
