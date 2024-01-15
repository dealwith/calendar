import { Strong } from "@radix-ui/themes";
import { Attendee } from "../interfaces/Event";

export const parseAttendees = (attendees?: Attendee[]) => {
	if (!attendees) return [];

	return (
		<section>
				<Strong>Attendees</Strong>
		{attendees.map((attendee) => <div key={attendee.email}>{attendee.email}</div>)}
	</section>
	)
}