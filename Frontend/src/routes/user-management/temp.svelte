{#if targetUserDetails && targetUserDetails.user_name == user.user_name}
	<td>user.user_name</td>
	<td><input type="password" bind:value={targetUserDetails.password} /></td>
	<td><input type="text" bind:value={targetUserDetails.email} /></td>
	<td>
		<select bind:value={targetUserDetails.active}>
			<option value="1">"Active"</option>
			<option value="0">"Disabled"</option>
		</select>
	</td>
	<td>test</td>
	<td>test</td>
	<td>
		<details>
			<summary>Select groups</summary>
			<ul>
				{#each groups as group}
					<li>
						<!-- <label> -->
						<!-- <input type="checkbox" bind:checked={user.groups[group]} /> -->
						<p>{group}</p>
						<!-- </label> -->
					</li>
				{/each}
			</ul>
		</details>
	</td>
{:else}{/if}
