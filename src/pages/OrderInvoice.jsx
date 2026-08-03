// src/pages/OrderInvoice.jsx
import React from 'react';
import logo from '../assets/logo.png';
import { useLocation } from 'react-router-dom';

// ---------- Helper: Convert number to English words (Indian system) ----------

function numberToWords(amount) {
  // 1. JavaScript floating-point bug se bachne ke liye standard rounding
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees).toFixed(2) * 100);

  // 2. Chote numbers (1 se 999) ko words me convert karne ka aasan helper
  const convertLessThanThousand = (num) => {
    if (num === 0) return "";

    const ones = {
      1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five",
      6: "Six", 7: "Seven", 8: "Eight", 9: "Nine"
    };

    const teens = {
      10: "Ten", 11: "Eleven", 12: "Twelve", 13: "Thirteen", 14: "Fourteen",
      15: "Fifteen", 16: "Sixteen", 17: "Seventeen", 18: "Eighteen", 19: "Nineteen"
    };

    const tens = {
      2: "Twenty", 3: "Thirty", 4: "Forty", 5: "Fifty",
      6: "Sixty", 7: "Seventy", 8: "Eighty", 9: "Ninety"
    };

    // Agar single digit hai (1-9)
    if (num < 10) return ones[num];

    // Agar teens hai (10-19)
    if (num < 20) return teens[num];

    // Agar double digit hai (20-99)
    if (num < 100) {
      const remainingOnes = num % 10;
      return tens[Math.floor(num / 10)] + (remainingOnes !== 0 ? " " + ones[remainingOnes] : "");
    }

    // Agar triple digit hai (100-999)
    const remainingTens = num % 100;
    return ones[Math.floor(num / 100)] + " Hundred" + (remainingTens !== 0 ? " " + convertLessThanThousand(remainingTens) : "");
  };

  // 3. Indian Format (Crore, Lakh, Thousand) me break karne ka main logic
  const integerToWords = (num) => {
    if (num === 0) return "";

    let result = "";
    
    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;

    if (crore > 0) result += convertLessThanThousand(crore) + " Crore ";
    if (lakh > 0) result += convertLessThanThousand(lakh) + " Lakh ";
    if (thousand > 0) result += convertLessThanThousand(thousand) + " Thousand ";
    if (remainder > 0) result += convertLessThanThousand(remainder);

    return result.trim();
  };

  // 4. Final Output Formatting (Rupees and Paise rules)
  const rupeesWords = rupees === 0 ? "" : integerToWords(rupees) + " Rupee" + (rupees > 1 ? "s" : "");
  const paiseWords = paise === 0 ? "" : convertLessThanThousand(paise) + " Paise";

  if (rupees === 0 && paise === 0) return "Zero Rupees Only";
  if (rupees === 0) return `${paiseWords} Only`;
  if (paise === 0) return `${rupeesWords} Only`;
  
  return `${rupeesWords} and ${paiseWords} Only`;
}





const OrderInvoice = ({order}) => {

  
 
  // const location = useLocation()
  // const order = location.state?.orderData ;
  // console.log(order)


  if (!order) return <p className="text-center py-10">Order not found.</p>;

  // ---------- Extract data directly from API ----------
  const orderNumber = order.order_number || '-';
  const orderDate = order.timestamps?.created_at
    ? new Date(order.timestamps.created_at).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    : '-';

  const invoiceNo = order.invoice_number || '-';
  const invoiceDetails = order.payment?.transaction_id || '-';
  const invoiceDate = order.timestamps?.created_at
    ? new Date(order.timestamps.created_at).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    : '-';

  // Address
  const addr = order.address?.snapshot || {};
  const billingAddress = `${addr.name || ''}, ${addr.email || ''}, ${addr.address || ''}, ${addr.city || ''}, ${addr.state || ''}, ${addr.country || ''} - ${addr.pincode || ''}, Mob - ${addr.mobile || ''}, ${addr.alternative_mobile || ''}`.replace(/,\s*,/g, ',').replace(/,\s*$/, '');
  const shippingAddress = billingAddress;
  const stateCode = addr.state_code || null;
  const placeOfSupply = addr.state || '-';
  const placeOfDelivery = placeOfSupply;

  // Items
  const items = order.items || [];

  // Pricing and tax info from API
  const pricing = order.pricing || {};
  const subtotal = parseFloat(pricing.subtotal) || 0;
  const taxableAmount = parseFloat(pricing.taxable_amount) || 0;
  const igstAmount = parseFloat(pricing.igst_amount) || 0;
  const cgstAmount = parseFloat(pricing.cgst_amount) || 0;
  const sgstAmount = parseFloat(pricing.sgst_amount) || 0;
  // ---------- Shipping GST (alag se) ----------
const shippingGstRate = parseFloat(pricing.shipping_gst_rate) || 0;
const shippingGstTotal = parseFloat(pricing.shipping_gst_amount) || 0;

// ---------- COD GST (alag se) ----------
const codGstRate = parseFloat(pricing.cod_gst_rate) || 0;
const codGstTotal = parseFloat(pricing.cod_gst_amount) || 0;
  const rawTaxType = pricing.tax_type; // 'igst' or 'cgst_sgst'
  const isCgstSgst = rawTaxType === 'cgst_sgst';
  const taxTypeDisplay = isCgstSgst ? 'CGST+SGST' : 'IGST';
  const deliveryCharge = parseFloat(pricing.delivery_charge) || 0;
  const discount = parseFloat(pricing.discount) || 0;
  const isCod = order.payment.mode === "cod";
  const COD_SURCHARGE =parseFloat(pricing.cod_charge)  ;
  const advancePaid = parseFloat(pricing?.advance_paid_amount)
  const remainingCod = parseFloat(pricing?.remaining_cod_amount)
  const grandTotal = remainingCod > 0 ? remainingCod : parseFloat(pricing.total_amount) || 0;
  
  // Payment
  const transactionId = order.payment?.transaction_id || '-';
  const paidAt = order.payment?.paid_at
    ? new Date(order.payment.paid_at).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    : '-';
  const paymentMode = order.payment?.mode || order.payment?.gateway || 'Online';
  const invoiceValue = grandTotal;

  // Convert amount to words
  const amountInWords = numberToWords(invoiceValue);

  // Shipping ke liye alag function
const getShippingTaxSplit = () => {
  const totalTax = shippingGstTotal; // backend se aayi value
  if (isCgstSgst) {
    return { cgst: totalTax / 2, sgst: totalTax / 2 };
  } else {
    return { igst: totalTax };
  }
};

// COD ke liye alag function
const getCodTaxSplit = () => {
  const totalTax = codGstTotal; // backend se aayi value
  if (isCgstSgst) {
    return { cgst: totalTax / 2, sgst: totalTax / 2 };
  } else {
    return { igst: totalTax };
  }
};

  // Build item rows with all 9 columns (stacked for CGST+SGST)
  const itemRows = items.map((item, idx) => {
    const price = parseFloat(item.price) || 0;
    const qty = item.quantity || 1;
    const net = price * qty;
    const hsnCode = order.hsn_code;

    // Per-item GST
  const itemTaxType = item.tax_type || 'cgst_sgst';
  const isItemCgstSgst = itemTaxType === 'cgst_sgst';
  const totalGst = parseFloat(item.gst_amount) || 0;
  const itemGstRate = parseFloat(item.gst_rate) || 0;

    // For CGST+SGST, we show two lines in Tax Rate, Tax Type, Tax Amount cells
   const displayGstAmount = isItemCgstSgst ? (totalGst / 2) : totalGst;
  const displayGstRate = isItemCgstSgst ? (itemGstRate / 2).toFixed(2) : null;

    return (
      <tr key={idx} className="border-b border-black text-xs">
        <td className="border-r border-black p-1 align-middle text-center">{idx + 1}</td>
        <td className="border-r border-black p-2 align-middle text-left pl-6">
          <div className='flex flex-col items-start '>
          <p>{item.name} {item.ratti && `(Ratti-${item.ratti})`}</p>
          <p className="mt-1">HSN: {hsnCode || 'N/A'}</p>
          </div>
        </td>
        <td className="border-r border-black p-1 align-middle text-center">₹{price.toFixed(2)}</td>
        <td className="border-r border-black p-1 align-middle text-center">{qty}</td>
        <td className="border-r border-black p-1 align-middle text-center">₹{net.toFixed(2)}</td>

        {/* Tax Rate column - stacked for CGST/SGST */}
        <td className="border-r border-black p-1 align-middle text-center">
          {isItemCgstSgst ? (
            <>
              <div>{displayGstRate}%</div>
              <div>{displayGstRate}%</div>
            </>
          ) : (
            <div>{itemGstRate}%</div>
          )}
        </td>

        {/* Tax Type column - stacked for CGST/SGST */}
        <td className="border-r border-black p-1 align-middle text-center">
          {isItemCgstSgst ? (
            <>
              <div>CGST</div>
              <div>SGST</div>
            </>
          ) : (
            <div>IGST</div>
          )}
        </td>

        {/* Tax Amount column - stacked for CGST/SGST */}
        <td className="border-r border-black p-1 align-middle text-center">
          {isItemCgstSgst ? (
            <>
              <div>₹{displayGstAmount.toFixed(2)}</div>
              <div>₹{displayGstAmount.toFixed(2)}</div>
            </>
          ) : (
            <div>₹{displayGstAmount.toFixed(2)}</div>
          )}
        </td>

        <td className="p-1 align-middle text-center">₹{net.toFixed(2)}</td>
      </tr>
    );
  });

  // Shipping row (if delivery charge > 0)
  let shippingRow = null;
  if (deliveryCharge > 0) {
    const shippingNet = deliveryCharge;
    const taxSplit = getShippingTaxSplit(shippingNet);
    const taxAmountTotal = isCgstSgst ? taxSplit.cgst + taxSplit.sgst : taxSplit.igst;
    const shippingTotal = shippingNet;
    const halfRate = isCgstSgst ? (shippingGstRate / 2).toFixed(2) : null;

    shippingRow = (
      <tr className="text-xs last:border-b last:border-black">
        <td className="border-r  border-black p-1 align-top text-center"> </td>
        <td className="border-r border-b border-black p-2 align-middle text-left pl-6">
          <p>Shipping Charge</p>
        </td>
        <td className="border-r border-b border-black p-1 align-middle text-center">₹{deliveryCharge.toFixed(2)}</td>
        <td className="border-r border-b border-black p-1 align-middle text-center">1</td>
        <td className="border-r border-b border-black p-1 align-middle text-center">₹{shippingNet.toFixed(2)}</td>

        {/* Tax Rate column - stacked for CGST/SGST */}
        <td className="border-r border-b border-black p-1 align-middle text-center">
          {isCgstSgst ? (
            <>
              <div>{halfRate}%</div>
              <div>{halfRate}%</div>
            </>
          ) : (
            <div>{shippingGstRate}%</div>
          )}
        </td>

        {/* Tax Type column - stacked for CGST/SGST */}
        <td className="border-r border-b border-black p-1 align-middle text-center">
          {isCgstSgst ? (
            <>
              <div>CGST</div>
              <div>SGST</div>
            </>
          ) : (
            <div>IGST</div>
          )}
        </td>

        {/* Tax Amount column - stacked for CGST/SGST */}
        <td className="border-r border-b border-black p-1 align-middle text-center">
          {isCgstSgst ? (
            <>
              <div>₹{taxSplit.cgst.toFixed(2)}</div>
              <div>₹{taxSplit.sgst.toFixed(2)}</div>
            </>
          ) : (
            <div>₹{taxSplit.igst.toFixed(2)}</div>
          )}
        </td>

        <td className="p-1 border-b border-black align-middle text-center">₹{shippingTotal.toFixed(2)}</td>
      </tr>
    );
  }


  

  // ---------- COD Charge Row (similar to shipping) ----------
let codRow = null;
if (isCod && COD_SURCHARGE > 0) {
  const codNet = COD_SURCHARGE;
  const taxSplit = getCodTaxSplit(codNet);
  const codTotal = codNet; // Total amount column mein Net amount hi dikhega (tax alag column mein hai)

  const halfRate = isCgstSgst ? (codGstRate / 2).toFixed(2) : null;

  codRow = (
    <tr className="border-b  border-black text-xs">
      {/* Sl.No - blank */}
      <td className="border-r border-black p-1 align-top text-center"> </td>

      {/* Description */}
      <td className="border-r border-black p-2 align-middle text-left pl-6">
        <p>COD Charge</p>
      </td>

      {/* Unit Price */}
      <td className="border-r border-black p-1 align-middle text-center">₹{codNet.toFixed(2)}</td>

      {/* Qty */}
      <td className="border-r border-black p-1 align-middle text-center">1</td>

      {/* Net Amount */}
      <td className="border-r border-black p-1 align-middle text-center">₹{codNet.toFixed(2)}</td>

      {/* Tax Rate - stacked for CGST/SGST */}
      <td className="border-r border-black p-1 align-middle text-center">
        {isCgstSgst ? (
          <>
            <div>{halfRate}%</div>
            <div>{halfRate}%</div>
          </>
        ) : (
          <div>{codGstRate}%</div>
        )}
      </td>

      {/* Tax Type - stacked for CGST/SGST */}
      <td className="border-r border-black p-1 align-middle text-center">
        {isCgstSgst ? (
          <>
            <div>CGST</div>
            <div>SGST</div>
          </>
        ) : (
          <div>IGST</div>
        )}
      </td>

      {/* Tax Amount - stacked for CGST/SGST */}
      <td className="border-r border-black p-1 align-middle text-center">
        {isCgstSgst ? (
          <>
            <div>₹{taxSplit.cgst.toFixed(2)}</div>
            <div>₹{taxSplit.sgst.toFixed(2)}</div>
          </>
        ) : (
          <div>₹{taxSplit.igst.toFixed(2)}</div>
        )}
      </td>

      {/* Total Amount */}
      <td className="p-1 align-middle text-center">₹{codTotal.toFixed(2)}</td>
    </tr>
  );
}



  return (
    <div className="w-full">
      {/* A4 PAGE */}
      <div className="w-[794px] min-h-[1123px] flex flex-col bg-white mx-auto text-black font-sans ">
        {/* HEADER */}
        <div className="flex justify-between items-center px-8 pt-6 ">
          <div>
            <img src={logo} alt="Logo" className="h-14" />
          </div>
          <div className="text-right leading-tight">
            <h2 className="font-bold text-md">Tax Invoice/Bill of Supply</h2>
            <p className="text-md">(Original for Recipient)</p>
          </div>
        </div>

        {/* ADDRESS SECTION */}
        <div className="flex justify-between px-10 mt-14">
          <div className="w-[45%] text-md leading-[1.15]">
            <p className="font-bold text-sm">Sold By :</p>
            <p>Veltex Services Private Limited, </p>
            <div className="">
              <p>711, Plot A09, ITL Tower, Netaji Subhash Place, Pitampura, Delhi 110034</p>
            </div>
            <div className="mt-14">
              <p className="text-sm">
                <span className="font-bold">PAN No:</span> AAGCK6574Q
              </p>
              <p className="text-sm">
                <span className="font-bold">GST Registration No:</span> 07AAGCK6574Q1ZO
              </p>
            </div>
          </div>
          <div className="w-[40%] text-[18px] leading-[1.1] text-right">
            <div>
              <p className="font-bold text-sm">Billing Address :</p>
              <p className="text-sm">{billingAddress}</p>
              {stateCode && (
                <p className="mt-2 text-sm">
                  <span className="font-bold text-sm">State/UT Code:</span> {stateCode}
                </p>
              )}
            </div>
            <div className="mt-8 text-sm">
              <p className="font-bold">Shipping Address :</p>
              <p className="text-sm">{shippingAddress}</p>
              {stateCode && (
                <p className="mt-2 text-sm">
                  <span className="font-bold text-sm">State/UT Code:</span> {stateCode}
                </p>
              )}
              <p>
                <span className="font-bold">Place of supply:</span> {placeOfSupply}
              </p>
              <p>
                <span className="font-bold">Place of delivery:</span> {placeOfDelivery}
              </p>
            </div>
          </div>
        </div>

        {/* ORDER DETAILS */}
        <div className="flex justify-between px-10 mt-14 text-sm">
          <div>
            <p>
              <span className="font-bold">Order Number:</span> {orderNumber}
            </p>
            <p>
              <span className="font-bold">Order Date:</span> {orderDate}
            </p>
          </div>
          <div className="text-right">
            <p>
              <span className="font-bold">Invoice Number :</span> {invoiceNo}
            </p>
            <p>
              <span className="font-bold">Invoice Date :</span> {invoiceDate}
            </p>
          </div>
        </div>

        {/* FULL TABLE WITH ALL COLUMNS (original layout) */}
        <div className="mx-8 mt-6 border border-black">
          <table className="w-full table-fixed border-collapse text-xs ">
            <thead>
              <tr className="bg-white font-bold border-b border-black text-center">
                <th className="border-r border-black p-1 w-[6%]">Sl.No</th>
                <th className="border-r border-black p-1 text-center align-middle w-[36%]">Description</th>

                <th className="border-r border-black p-1 w-[11%] text-center align-middle">Unit<br />Price</th>
                <th className="border-r border-black p-1 w-[6%] text-center align-middle">Qty</th>
                <th className="border-r border-black p-1 w-[11%] text-center align-middle">Net<br />Amount</th>
                <th className="border-r border-black p-1 w-[8%] text-center align-middle">Tax<br />Rate</th>
                <th className="border-r border-black p-1 w-[8%] text-center align-middle">Tax<br />Type</th>
                <th className="border-r border-black p-1 w-[11%] text-center align-middle">Tax<br />Amount</th>
                <th className="p-1 w-[11%] text-center align-middle">Total<br />Amount</th>
              </tr>
            </thead>
            <tbody>
              {itemRows}
              {shippingRow}
              {codRow}
            </tbody>
            <tfoot>
              {/* Subtotal row - optional lekin helpful */}
              {/* <tr className="border-b border-black">
                <td colSpan="5" className="border-r border-black p-1 text-left font-semibold">Subtotal:</td>
                <td colSpan="3" className="border-r border-black p-1 text-center">–</td>
                <td className="p-1 text-center">₹{subtotal.toFixed(2)}</td>
              </tr> */}


              {/* advance paid  row - sirf tab dikhe jab advancePaid > 0 */}
              {advancePaid > 0 && (
                <tr className="border-b border-black ">
                  <td colSpan="5" className="border-r border-black p-1 text-left font-semibold">Convenience Charge:</td>
                  <td colSpan="3" className="border-r border-black p-1 text-center ">–</td>
                  <td className="p-1 text-center">-₹{advancePaid.toFixed(2)}</td>
                </tr>
              )}
              {/* Discount row - sirf tab dikhe jab discount > 0 */}
              {discount > 0 && (
                <tr className="border-b border-black ">
                  <td colSpan="5" className="border-r border-black p-1 text-left font-semibold">Discount:</td>
                  <td colSpan="3" className="border-r border-black p-1 text-center ">–</td>
                  <td className="p-1 text-center">-₹{discount.toFixed(2)}</td>
                </tr>
              )}
              

              {/* Original TOTAL row */}
             {/* Original TOTAL row */}
              <tr className="border-b border-black font-bold">
                <td colSpan="8" className="border-r border-black p-1 text-left">TOTAL:</td>
                <td className="p-1 text-center">₹{grandTotal.toFixed(2)}</td>
              </tr>

              {/* Baki sab rows (Amount in Words, signature, etc.) wahi rahega */}
              <tr className="border-b border-black">
                <td colSpan="9" className="p-2">
                  <div className="flex justify-between items-start">
                    <div className="w-3/5 pr-2">
                      <p className="font-bold text-sm">Amount in Words:</p>
                      <p className="font-bold text-sm">{amountInWords}</p>
                    </div>
                    <div className="w-2/5 pl-2 text-right">
                      <p className="font-bold text-sm">For Veltex Services Private Limited:</p>
                      <div className="flex justify-end pr-10">
                        <img src="/signature.png" alt="signature" className="w-[90px]" />
                      </div>
                      <p className="font-bold text-sm">Authorized Signatory</p>
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="border-b border-black">
                <td colSpan="9" className="p-2 text-sm">Whether tax is payable under reverse charge - NO</td>
              </tr>
              <tr>
               {order?.payment?.mode !== "cod" && <td colSpan="2" className="border-r border-black p-2 align-top">
                  <p className="font-bold">Payment Transaction ID:</p>
                  <p>{transactionId}</p>
                </td>}
                {order?.payment?.mode !== "cod" && <td colSpan="4" className="border-r border-black p-2 align-top">
                  <p className="font-bold">Date & Time:</p>
                  <p className='text-nowrap'>{paidAt}</p>
                </td>}
                <td colSpan="2" className={`p-2 align-top ${order?.payment?.mode === "cod" && "flex gap-1"}`}>
                  <p className="font-bold text-nowrap">Mode of Payment:</p>
                  <p>{paymentMode.toUpperCase()}</p>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        {/* DISCLAIMER / FOOTER - stays at bottom of every page */}
        <div className="mt-auto text-[8px] font-semibold text-gray-600 p-4 rounded-b-md flex flex-col justify-center items-center flex-wrap ">
          <p className="mb-1">Please note that this invoice is not a demand for payment.</p>
          <div className="mb-1">
            <p className="font-semibold flex justify-center">
              Regd Office: VELTEX SERVICES PRIVATE LIMITED
            </p>

            <div className="font-semibold flex flex-col items-center">
              <p>711, Plot A09, ITL Towers, Netaji Subhash Place,</p>
              <p>Pitampura, Delhi 110034, Bharat</p>
            </div>
          </div>
          <p className="mb-1">
            Email: care@astrotring.shop | Tel: +91 11 41103510
          </p>
          <p className="text-[8px] font-bold">
            Customers desirous of availing input GST credit are requested to write an email at care@astrotring.com
            and get a Business account on Business eligible offers.
          </p>
        </div>
      </div>

    </div>
  );
};

export default OrderInvoice;