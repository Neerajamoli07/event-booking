import React, { Component } from 'react';

import Spinner from '../components/Spinner/Spinner';
import AuthContext from '../context/auth-context';
import BookingList from '../components/Bookings/BookingList/BookingList';
import BookingsChart from '../components/Bookings/BookingsChart/BookingsChart';
import BookingsControl from '../components/Bookings/BookingsControl/BookingsControl';

class BookingsPage extends Component {
    state = {
        isLoading: false,
        bookings: [],
        outputType: 'list'
    };

    isActive = true;

    static contextType = AuthContext;

    componentDidMount() {
        this.fetchBookings();
    }

    fetchBookings = () => {
        this.setState({isLoading: true});
        const  requestBody = {
            query: `
              query { 
                bookings{
                    _id
                     createdAt
                     event {
                         _id
                         title
                         date
                         price
                     }
                    }
                 }
               
               `
            };


          fetch('http://localhost:5000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
               'Content-Type': 'application/json',
               'Authorization': 'Bearer ' + this.context.token
            }

          }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
              throw new Error('Failed!');
            }
              return res.json();
          })
          .then(resData => {
             const bookings = resData.data.bookings;
             if(this.isActive){
               this.setState({bookings: bookings, isLoading: false});
             }
          })
          .catch(err => {
             console.log(err);
             
             if(this.isActive){ 
               this.setState({isLoading: false});
             }
          });
    }

    componentWillUnmount() {
        this.isActive = false;
    }

    deleteBookingHandler = bookingId => {
        this.setState({isLoading: true});
        const  requestBody = {
            query: `
              mutation cancelBooking($id: ID!){ 
                cancelBooking(bookingId: $id){
                    _id
                    title
                    }
                 }
               
               `,
               variables: {
                   id: bookingId
               }
            };


          fetch('http://localhost:5000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
               'Content-Type': 'application/json',
               'Authorization': 'Bearer ' + this.context.token
            }

          }).then(res => {
            if (res.status !== 200 && res.status !== 201) {
              throw new Error('Failed!');
            }
              return res.json();
          })
          .then(resData => {
              this.setState(prevState => {
                  const updatedBookings = prevState.bookings.filter(booking => {
                      return booking._id !== bookingId;
                  });
                  return { bookings: updatedBookings, isLoading: false };
              });
          })
          .catch(err => {
             console.log(err);
          });

    }

    changeOutputTypeHandler = outputType => {
      if(outputType === 'list'){
        this.setState({outputType: 'list'});
      }else{
        this.setState({outputType: 'chart'});
      }
    }

    render() {
      let content = <Spinner />;
      if(!this.state.isLoading){
        content = (
          <React.Fragment>
            <BookingsControl 
               activeOutputType={this.state.outputType}
               onChange={this.changeOutputTypeHandler}/>
            <div>
              {this.state.outputType === 'list' ? (
                <BookingList bookings={this.state.bookings} 
                     onDelete={this.deleteBookingHandler}/> 
              ) : (
                <BookingsChart 
                        bookings={this.state.bookings} 
                        onDelete={this.deleteBookingHandler}/> 
              )}
                 
            </div>
              
          </React.Fragment>
        );

      }
        return (
          <React.Fragment>
            {content}
          </React.Fragment>
        );
    }
}

export default BookingsPage;