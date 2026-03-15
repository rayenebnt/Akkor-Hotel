const ReservationCard = ({reservation}) => {

 return(

  <div>

   <p>Hotel: {reservation.hotelId}</p>

   <p>From: {reservation.dateFrom}</p>

   <p>To: {reservation.dateTo}</p>

  </div>

 )

}

export default ReservationCard