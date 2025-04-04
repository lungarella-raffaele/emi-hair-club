<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import Logo from '$lib/components/app/logo.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { BARBER_SHOP_DETAILS } from '$lib/constants';
	import type { PageProps } from './$types';
	import ConfirmReservation from './confirmreservation.svelte';
	import Timer from './timer.svelte';

	const { data }: PageProps = $props();

	// State management with reactivity
	const confirmReservation = page.url.searchParams.get('reservation');
	const confirmUser = page.url.searchParams.get('user');
	const pendingReservation = page.url.searchParams.get('pending');

	// Timer handling with error protection
	const timer = new Timer();
	let showTimer = $state(false);
	$effect(() => {
		if (
			pendingReservation &&
			data.pendingReservation &&
			data.pendingReservation.pending &&
			browser
		) {
			const expiryTime = data.pendingReservation.expiresAt.getTime();
			const currentTime = new Date().getTime();
			const timeLeft = expiryTime - currentTime;
			showTimer = true;

			if (timeLeft > 0) {
				timer.start(timeLeft);
			} else {
				// Handle expired reservation
				timer.reset();
				showTimer = false;
			}
		} else {
			timer.reset();
			showTimer = false;
		}
	});
</script>

{#if confirmReservation && data.reservation}
	<ConfirmReservation
		reservation={data.reservation}
		reservationConfirmed={data.reservationConfirmed}
	/>
{:else}
	<div class="mb-16 mt-16 flex flex-col items-center">
		<Logo />

		{#if showTimer && data.pendingReservation}
			<Card.Root class="mb-12 w-[350px]">
				<Card.Header>
					<Card.Title>Prenotazione in attesa</Card.Title>
					<Card.Description>
						Abbiamo inviato una mail all'indirizzo: {data.pendingReservation.email ||
							'email non disponibile'}. Controlla la tua casella di posta e cliccare
						sul link contenuto nell'email per confermare la tua prenotazione prima dello
						scadere del tempo.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="text-center text-xl font-bold">
						<div class="mb-2">
							{timer.show()}
						</div>
						<Progress value={timer.timeLeft} max={60 * 1000 * 10} />
					</div>
				</Card.Content>
			</Card.Root>
		{/if}

		{#if confirmUser}
			<!-- TODO -->
			<div class="mb-4 text-xl font-bold">BENVENUTO</div>
		{/if}

		<Button href="/newreservation">Prenota</Button>
		<p class="my-3 text-muted-foreground">oppure</p>
		<span>
			<a class="underline" href="Tel:{BARBER_SHOP_DETAILS.phone}">Chiama</a>
			al {BARBER_SHOP_DETAILS.phone || 'numero non disponibile'}
		</span>
	</div>
{/if}
