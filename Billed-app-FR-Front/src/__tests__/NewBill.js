/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import store from "../__mocks__/store.js";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import mockStore from "../__mocks__/store";


const inputData = {
  pct: 20,
  amount: 170,
  name: "new bill test",
  vat: "40",
  fileName: "preview-facture.jpg",
  date: "2023-04-18",
  commentary: "is a new bill",
  type: "Restaurants et bars",
};

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {

  test("When I am on NewBill Page", () => {
    const html = NewBillUI();
    document.body.innerHTML = html;
    expect(html).toBeDefined();
  });


  describe("When I do fill fields in correct format and I click on subbmit button", () => {
    
    test("Then It should create bill", () => {
      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          email: "employee@test.tld",
          type: "Employee",
        })
      );

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });

      const inputType = screen.getByTestId("expense-type");
      fireEvent.change(inputType, { target: { value: inputData.type } });
      expect(inputType.value).toBe(inputData.type);

      const inputName = screen.getByTestId("expense-name");
      fireEvent.change(inputName, {
        target: { value: inputData.name },
      });
      expect(inputName.value).toBe(inputData.name);

      const inputDate = screen.getByTestId("datepicker");
      fireEvent.change(inputDate, {
        target: { value: inputData.date },
      });
      expect(inputDate.value).toBe(inputData.date);

      const inputAmount = screen.getByTestId("amount");
      fireEvent.change(inputAmount, {
        target: { value: inputData.amount },
      });
      expect(parseFloat(inputAmount.value)).toBe(inputData.amount);

      const inputVat = screen.getByTestId("vat");
      fireEvent.change(inputVat, {
        target: { value: inputData.vat },
      });
      expect(inputVat.value).toBe(inputData.vat);

      const inputPct = screen.getByTestId("pct");
      fireEvent.change(inputPct, {
        target: { value: inputData.pct },
      });
      expect(parseFloat(inputPct.value)).toBe(inputData.pct);

      const inputCommentary = screen.getByTestId("commentary");
      fireEvent.change(inputCommentary, {
        target: { value: inputData.commentary },
      });
      expect(inputCommentary.value).toBe(inputData.commentary);

      const btnUploadFile = screen.getByTestId("file");
      const imgValues = [{ name: "img.jpg" }];
      const imgStr = JSON.stringify(imgValues);
      const imgBlob = new Blob([imgStr]);
      const file = new File([imgBlob], inputData.fileName);

      userEvent.upload(btnUploadFile, file);

      let value = document.querySelector('input[data-testid="file"]').files[0].name;
      expect(value).toBe(inputData.fileName);

      const handleSubmit = jest.fn(newBill.handleSubmitAdmin);
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      const billList = screen.getByTestId('tbody')
      expect(billList).toBeTruthy()
    });

  
  });
  
  test("Then error page should be rendered", async () => {
    document.body.innerHTML = NewBillUI();

    const onNavigate = (pathname, data, error) => {
      document.body.innerHTML = ROUTES({ pathname, data, error });
    };

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        email: "employee@test.tld",
        type: "Employee",
      })
    );

    const newBill = new NewBill({
      document,
      onNavigate,
      store,
      localStorage,
    });

    let res = mockStore.bills(() => {
      return {
        list : () =>  {
          return Promise.reject(new Error("Erreur 50"))
        }
    }})

    newBill.onNavigate(ROUTES_PATH["Bills"], {data: res},"Erreur 404" )
   
    await new Promise(process.nextTick);
    const message = screen.getByText(/Erreur 404/)

    expect(message).toBeTruthy()

  });
});