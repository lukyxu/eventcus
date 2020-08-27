import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Col, Row, Container } from "react-bootstrap";
import { ErrorMessage } from "@hookform/error-message";
import PostForm from './../services/post-form.js';
import CurrencyInput from 'react-currency-input-field';

export default function EventHookForm({fetchEvents}) {
  const { register, handleSubmit, getValues, errors, control, reset } = useForm({
    criteriaMode: "all",
    defaultValues: {
      ticketTypes: [{ type: "", price: 0, quantity: 0 }]
    }
  });

  const { fields, remove, append } = useFieldArray({
    control,
    name: "ticketTypes",
    defaultValue: { type: "", price: 0, quantity: 0 }
  });

  const fieldsOptions = {
    "Full Name": true,
    "Shortcode": true,
    "Email": true,
    "Contact Number": true,
    "Food Allergies": false
  };

  const camelize = (text) => {
    text = text.replace(/[-_\s.]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
    return text.substr(0, 1).toLowerCase() + text.substr(1);
  }

  const onSubmit = async (data) => {
    var temp = {
      fullName: false,
      shortcode: false,
      email: false,
      contactNumber: false,
      foodAllergies: false
    }
    data.fieldsChecked.forEach(option => {
      temp[camelize(option)] = true;
    })
    data.fieldsChecked = temp;
    console.log(typeof data.ticketRelease);
    let res = await PostForm(data);
    console.log(res)
    await fetchEvents()
    console.log("Done")

  }; // your form submit function which will invoke after successful validation

  // console.log(watch("eventName")); // you can watch individual input by pass the name of the input

  return (
    <Container fluid className="eventFormMain">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col md={12} xl={4} className="formSection">
            <h2>Event Details</h2>
            <hr></hr>
            <Row>
              <Col xs={12} sm={6} xl={12}>
                <h5>Event Name</h5>
                <input
                  className="fieldInput"
                  name="eventName"
                  placeholder="Event name"
                  ref={register({ required: true })}
                />
                {errors.eventName && <p className="eventFormErrorMessage">This field is required</p>}
              </Col>
            </Row>
            <Row>
              <Col  xs={12} sm={6} xl={12}>
                <h5>Event Date</h5>
                <input
                  className="fieldInput"
                  name="eventDate"
                  placeholder="Event Time/Date"
                  type="datetime-local"
                  // onChange={async () => {
                  //   await trigger("ticketRelease")
                  //   }
                  // }
                  ref={register({ required: true })}
                />
                {errors.eventDate && <p className="eventFormErrorMessage">This field is required</p>}
              </Col>
              <Col xs={12} sm={6} xl={12}>
                <h5>Ticket Release</h5>
                <input
                  className="fieldInput"
                  name="ticketRelease"
                  placeholder="Choose date and time"
                  type="datetime-local"
                  // ref={register({ required: true })}
                  ref={register({
                    required: <p className="eventFormErrorMessage">This field is required</p>,
                    validate: {
                      beforeEvent: value => {
                        return new Date(value).getTime() <= new Date(getValues("eventDate")).getTime() || <p className="eventFormErrorMessage">Ticket release date should be before actual event date</p>
                      }
                    }
                  })}
                />
                <ErrorMessage
                  errors={errors}
                  name="ticketRelease"
                />
              </Col>
            </Row>
            <br></br>
            <Row>
              <Col>
                <h5>Event Details</h5>
                <textarea
                  className="fieldInput"
                  name="eventDetails"
                  placeholder="Enter some event details"
                  rows="8"
                  ref={register({ required: true })}
                />
                {errors.eventDetails && <p className="eventFormErrorMessage">This field is required</p>}
              </Col>
            </Row>
            <Row>
              <Col>
                <h5>Payment Information</h5>
                <textarea
                  className="fieldInput"
                  name="paymentInfo"
                  placeholder="Payment information"
                  rows="3"
                  ref={register({ required: true })}
                />
                {errors.paymentInfo && <p className="eventFormErrorMessage">This field is required</p>}
              </Col>
            </Row>
            <br></br>
          </Col>
          <Col md={12} xl={4} className="formSection">
            <h2>Ticket Information</h2>
            <hr></hr>
            <h5>Add ticket types</h5>
            {fields.map((ticket, index) => {
              return (
                <div key={ticket.id}>
                  <Row>
                    <Col xs={4} sm={4} style={{padding: "0px 5px 0px 15px"}}>
                      <input
                        className="fieldInput"
                        name={`ticketTypes[${index}].type`}
                        placeholder="Ticket Type"
                        // defaultValue={`${ticket.type}`} // make sure to set up defaultValue
                        ref={register({ required:<p className="eventFormErrorMessage">This field is required</p> })}
                      />
                      <ErrorMessage errors={errors} name={`ticketTypes[${index}].type`} />
                    </Col>
                    <Col xs={3} sm={3} style={{padding: "0px 5px"}}>
                      <Controller
                        as={<CurrencyInput allowDecimals={true} decimalsLimit={2} prefix="£" className="fieldInput" />}
                        name={`ticketTypes[${index}].price`}
                        control={control}
                        placeholder="Price"
                        defaultValue={ticket.price}
                        rules={{
                          required: <p className="eventFormErrorMessage">This field is required</p>,
                          pattern: {
                            value: /^-{0,1}\d+$/,
                            message: <p className="eventFormErrorMessage">This field is number only</p>
                          },
                          min: {
                            value: 0,
                            message: <p className="eventFormErrorMessage">Price should not be negative</p>
                          },
                          validate: value => value !== 0 || <p className="eventFormErrorMessage">This field is required</p>
                        }}
                      />
                      <ErrorMessage
                        errors={errors}
                        name={`ticketTypes[${index}].price`}
                      />
                    </Col>
                    <Col xs={3} sm={3} style={{padding: "0px 5px"}}>
                      <input
                        className="fieldInput"
                        name={`ticketTypes[${index}].quantity`}
                        type="number"
                        placeholder="Quantity"
                        // defaultValue={`${ticket.quantity}`} // make sure to set up defaultValue
                        ref={register({
                          required: <p className="eventFormErrorMessage">This field is required</p>,
                          min: {
                            value: 1,
                            message: <p className="eventFormErrorMessage">Quantity should be greater than 0</p>
                          }
                        })}
                      />
                      <ErrorMessage
                        errors={errors}
                        name={`ticketTypes[${index}].quantity`}
                      />
                    </Col>
                    <Col xs={2} sm={2} style={{ padding: "0px 15px 0px 5px" }}>
                      {fields.length > 1 ? (
                        <button
                          type="button"
                          className="blueButton"
                          style={{ padding: "10px 10px" }}
                          onClick={() => remove(index)}>
                          X
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="blueButton"
                          style={{ padding: "10px 10px" }}
                          onClick={() => {
                            reset({
                              ...getValues(),
                              ticketTypes: [{ type: "", price: 0, quantity: 0 }]
                            },{
                              errors: true
                            });
                          }}>
                          X
                        </button>
                      )}
                    </Col>
                  </Row>
                </div>
              );
            })}
            <hr></hr>
            <button
              type="button"
              className="blueButton"
              onClick={() => {
                append();
              }}
            >
              Add another ticket
            </button>
            <br></br>
          </Col>
          <Col md={12} xl={4} className="formSection" >
            <h2>Sign up Form</h2>
            <hr></hr>
            <h5>Select default fields to add to sign up form</h5>
            <div>
              {Object.keys(fieldsOptions).map((option) => (
                <div key={option}>
                  <input
                    className="checkboxInput"
                    type="checkbox"
                    value={option}
                    name="fieldsChecked"
                    ref={register}
                    defaultChecked={fieldsOptions[option]}
                    disabled={!option.localeCompare("Full Name") || !option.localeCompare("Email")}
                  />
                  <label>{option}</label>
                </div>
              ))}
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={0} sm={0} xl={4}></Col>
          <Col xs={12} sm={12} xl={4} className="formSection">
            <hr></hr>
            <button className="blueButton" type="submit">Create Event</button>
          </Col> 
          <Col xs={0} sm={0} xl={4}></Col>
          <Col></Col>      
        </Row>   
      </form>
    </Container>
  );
}