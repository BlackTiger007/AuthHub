<script lang="ts">
	const {
		title,
		checked = false,
		children
	}: { title: string; checked?: boolean; children: () => any } = $props();
</script>

<div class="bg-base-100 border-base-300 collapse border">
	<input type="checkbox" {checked} />
	<div class="collapse-title font-semibold">{title}</div>
	<div class="collapse-content text-sm">
		{@render children?.()}
	</div>
</div>
